import type {
  FontapplyGetGlyphResponse,
  FontapplyGlyphListResponse,
  FontapplyGlyphMetrics,
  FontapplyGlyphRequest,
  FontapplyHealthResponse,
  FontapplySaveGlyphRequest,
} from '../../../shared/types/fontapply';

const DEFAULT_FONT_API_BASE_URL = 'http://127.0.0.1:8000';

export class FontapplyApiError extends Error {
  readonly status?: number;
  readonly body?: string;

  constructor(message: string, options: { status?: number; body?: string } = {}) {
    super(message);
    this.name = 'FontapplyApiError';
    this.status = options.status;
    this.body = options.body;
  }
}

interface FontapplyClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

function resolveDefaultBaseUrl(): string {
  const envBaseUrl = (import.meta as ImportMeta & { env?: { VITE_FONT_API_BASE_URL?: string } }).env
    ?.VITE_FONT_API_BASE_URL;
  return (envBaseUrl || DEFAULT_FONT_API_BASE_URL).replace(/\/+$/, '');
}

function withProjectId(path: string, projectId?: number): string {
  if (typeof projectId !== 'number' || Number.isNaN(projectId)) {
    return path;
  }
  const search = new URLSearchParams({ project_id: String(projectId) });
  return `${path}?${search.toString()}`;
}

async function requestJson<T>(
  fetchImpl: typeof fetch,
  baseUrl: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetchImpl(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new FontapplyApiError(`Fontapply request failed (${response.status}) ${init.method || 'GET'} ${path}`, {
      status: response.status,
      body,
    });
  }

  return (await response.json()) as T;
}

export function createFontapplyClient(options: FontapplyClientOptions = {}) {
  const baseUrl = (options.baseUrl || resolveDefaultBaseUrl()).replace(/\/+$/, '');
  const fetchImpl = options.fetchImpl || fetch;

  return {
    health: (): Promise<FontapplyHealthResponse> => requestJson(fetchImpl, baseUrl, '/health'),
    supportedGlyphs: (): Promise<FontapplyGlyphListResponse> => requestJson(fetchImpl, baseUrl, '/api/glyphs'),
    getGlyph: ({ unicode, projectId }: FontapplyGlyphRequest): Promise<FontapplyGetGlyphResponse> =>
      requestJson(fetchImpl, baseUrl, withProjectId(`/api/glyphs/${encodeURIComponent(unicode)}`, projectId)),
    getMetrics: ({ unicode }: Pick<FontapplyGlyphRequest, 'unicode'>): Promise<FontapplyGlyphMetrics> =>
      requestJson(fetchImpl, baseUrl, `/api/glyphs/${encodeURIComponent(unicode)}/metrics`),
    saveGlyph: ({ unicode, glyph, projectId }: FontapplySaveGlyphRequest): Promise<FontapplyGetGlyphResponse> =>
      requestJson(fetchImpl, baseUrl, withProjectId(`/api/glyphs/${encodeURIComponent(unicode)}`, projectId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(glyph),
      }),
  };
}

export type FontapplyClient = ReturnType<typeof createFontapplyClient>;
