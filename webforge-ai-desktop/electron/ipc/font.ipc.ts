import { ipcMain } from 'electron';

type FontOutputFormat = 'ttf' | 'woff2';
type PreviewType = 'sample' | 'grid' | 'sizes' | 'weights';
type CapStyle = 'butt' | 'round' | 'square';
type JoinStyle = 'miter' | 'round' | 'bevel';

export interface FontMetricsInput {
  upm?: number;
  ascender?: number;
  descender?: number;
  cap_height?: number;
  x_height?: number;
  line_gap?: number;
}

export interface StrokeParams {
  weight?: number;
  cap_style?: CapStyle;
  join_style?: JoinStyle;
}

export interface GlyphRequest {
  name: string;
  unicode?: number;
  shape?: string;
  advance_width?: number;
  lsb?: number;
  stroke?: StrokeParams;
}

export interface FontMetadataInput {
  family_name?: string;
  style_name?: string;
  version?: string;
  copyright?: string;
  designer?: string;
  description?: string;
  url?: string;
}

export interface GenerateFontRequest {
  metadata?: FontMetadataInput;
  metrics?: FontMetricsInput;
  glyphs: GlyphRequest[];
  output_format?: FontOutputFormat;
  include_kerning?: boolean;
}

export interface GenerateFontResponse {
  font_id: string;
  family_name: string;
  style_name: string;
  glyph_count: number;
  output_format: string;
  file_size_bytes: number;
  font_face_css: string;
  data_url: string;
}

export interface SubsetRequest {
  font_id?: string;
  file_b64?: string;
  text?: string;
  unicodes?: number[];
  preset?: 'landing_jp' | 'landing_en';
  output_format?: FontOutputFormat;
  hinting?: boolean;
}

export interface SubsetResponse {
  font_id: string;
  original_glyph_count: number;
  subset_glyph_count: number;
  original_size_bytes: number;
  subset_size_bytes: number;
  reduction_percent: string;
  font_face_css: string;
  data_url: string;
}

export interface ConvertRequest {
  font_id?: string;
  file_b64?: string;
  family_name?: string;
  style_name?: string;
  weight?: number;
  output_format?: FontOutputFormat;
}

export interface ConvertResponse {
  font_id: string;
  family_name: string;
  style_name: string;
  weight: number;
  original_size_bytes: number;
  converted_size_bytes: number;
  reduction_percent: string;
  font_face_css: string;
  data_url: string;
}

export interface PreviewRequest {
  font_id: string;
  type?: PreviewType;
  text?: string;
  width?: number;
  height?: number;
  font_size?: number;
  columns?: number;
}

const FONT_API_BASE_URL =
  process.env.FONT_API_BASE_URL ??
  process.env.WEBFORGE_FONT_API_BASE_URL ??
  'http://localhost:8000';
const FONT_API_TIMEOUT_MS = 60_000;

const IPC_CHANNELS = {
  generate: 'font:generate',
  subset: 'font:subset',
  convert: 'font:convert',
  preview: 'font:preview',
} as const;

async function fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FONT_API_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${FONT_API_TIMEOUT_MS}ms: ${input}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(`${FONT_API_BASE_URL}${path}`, init);

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload?.detail) detail = payload.detail;
    } catch {
      const text = await response.text();
      if (text) detail = text;
    }
    throw new Error(`HTTP ${response.status}: ${detail}`);
  }

  return (await response.json()) as T;
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function buildPreviewPath(request: PreviewRequest): string {
  const { font_id, ...params } = request;
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `/fonts/preview/${font_id}?${query}` : `/fonts/preview/${font_id}`;
}

export function registerFontIpcHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.generate);
  ipcMain.handle(IPC_CHANNELS.generate, async (_event, request: GenerateFontRequest) =>
    postJson<GenerateFontResponse>('/fonts/generate', request),
  );

  ipcMain.removeHandler(IPC_CHANNELS.subset);
  ipcMain.handle(IPC_CHANNELS.subset, async (_event, request: SubsetRequest) =>
    postJson<SubsetResponse>('/fonts/subset', request),
  );

  ipcMain.removeHandler(IPC_CHANNELS.convert);
  ipcMain.handle(IPC_CHANNELS.convert, async (_event, request: ConvertRequest) =>
    postJson<ConvertResponse>('/fonts/convert', request),
  );

  ipcMain.removeHandler(IPC_CHANNELS.preview);
  ipcMain.handle(IPC_CHANNELS.preview, async (_event, request: PreviewRequest) => {
    const response = await fetchWithTimeout(`${FONT_API_BASE_URL}${buildPreviewPath(request)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const payload = (await response.json()) as { detail?: string };
        if (payload?.detail) detail = payload.detail;
      } catch {
        const text = await response.text();
        if (text) detail = text;
      }
      throw new Error(`HTTP ${response.status}: ${detail}`);
    }

    return response.blob();
  });
}
