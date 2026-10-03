import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';
import type {
  FontapplyGetGlyphResponse,
  FontapplyGlyphListResponse,
  FontapplyGlyphMetrics,
  FontapplyGlyphRequest,
  FontapplyHealthResponse,
  FontapplySaveGlyphRequest,
} from '../../shared/types/fontapply';
import type {
  FontConvertRequest,
  FontConvertResponse,
  FontGenerateRequest,
  FontGenerateResponse,
} from '../../shared/types/font';
import { getJson, HttpClientError, postJson, putJson } from './utils';

function withProjectId(path: string, projectId?: number): string {
  if (typeof projectId !== 'number' || Number.isNaN(projectId)) {
    return path;
  }
  const search = new URLSearchParams({ project_id: String(projectId) });
  return `${path}?${search.toString()}`;
}

function logAndThrow(channel: string, error: unknown): never {
  if (error instanceof HttpClientError) {
    console.error(`[font.ipc] ${channel} failed`, {
      status: error.status,
      isTimeout: error.isTimeout,
      isNetworkError: error.isNetworkError,
      detail: error.detail,
      message: error.message,
    });
    throw error;
  }

  console.error(`[font.ipc] ${channel} unexpected error`, error);
  throw error;
}

function safeRemoveHandler(channel: string): void {
  try {
    ipcMain.removeHandler(channel);
  } catch (error) {
    console.warn(`[font.ipc] failed to remove existing handler: ${channel}`, error);
  }
}

// Font generation and conversion IPC handlers
export function registerFontIpc(): void {
  safeRemoveHandler(IPC_CHANNELS.font.generate);
  safeRemoveHandler(IPC_CHANNELS.font.convert);
  safeRemoveHandler(IPC_CHANNELS.fontapply.health);
  safeRemoveHandler(IPC_CHANNELS.fontapply.listGlyphs);
  safeRemoveHandler(IPC_CHANNELS.fontapply.getGlyph);
  safeRemoveHandler(IPC_CHANNELS.fontapply.getMetrics);
  safeRemoveHandler(IPC_CHANNELS.fontapply.saveGlyph);

  ipcMain.handle(IPC_CHANNELS.font.generate, async (_event, params: FontGenerateRequest) => {
    console.info('[font.ipc] font:generate', { glyph_count: params.glyphs?.length ?? 0 });
    try {
      return await postJson<FontGenerateResponse>('/fonts/generate', params);
    } catch (error) {
      logAndThrow(IPC_CHANNELS.font.generate, error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.font.convert, async (_event, params: FontConvertRequest) => {
    const request = { font_id: params.fontId };
    console.info('[font.ipc] font:convert', { has_font_id: Boolean(request.font_id) });
    try {
      return await postJson<FontConvertResponse>('/fonts/convert', request);
    } catch (error) {
      logAndThrow(IPC_CHANNELS.font.convert, error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.fontapply.health, async () => {
    try {
      return await getJson<FontapplyHealthResponse>('/health');
    } catch (error) {
      logAndThrow(IPC_CHANNELS.fontapply.health, error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.fontapply.listGlyphs, async () => {
    try {
      return await getJson<FontapplyGlyphListResponse>('/api/glyphs');
    } catch (error) {
      logAndThrow(IPC_CHANNELS.fontapply.listGlyphs, error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.fontapply.getGlyph, async (_event, request: FontapplyGlyphRequest) => {
    try {
      const path = withProjectId(`/api/glyphs/${encodeURIComponent(request.unicode)}`, request.projectId);
      return await getJson<FontapplyGetGlyphResponse>(path);
    } catch (error) {
      logAndThrow(IPC_CHANNELS.fontapply.getGlyph, error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.fontapply.getMetrics, async (_event, request: Pick<FontapplyGlyphRequest, 'unicode'>) => {
    try {
      return await getJson<FontapplyGlyphMetrics>(`/api/glyphs/${encodeURIComponent(request.unicode)}/metrics`);
    } catch (error) {
      logAndThrow(IPC_CHANNELS.fontapply.getMetrics, error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.fontapply.saveGlyph, async (_event, request: FontapplySaveGlyphRequest) => {
    try {
      const path = withProjectId(`/api/glyphs/${encodeURIComponent(request.unicode)}`, request.projectId);
      return await putJson<FontapplyGetGlyphResponse>(path, request.glyph);
    } catch (error) {
      logAndThrow(IPC_CHANNELS.fontapply.saveGlyph, error);
    }
  });

  console.info('[font.ipc] registered font IPC handlers');
}
