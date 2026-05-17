import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';
import {
  ConvertRequest,
  ConvertResponse,
  GenerateFontRequest,
  GenerateFontResponse,
  PreviewRequest,
  SubsetRequest,
  SubsetResponse,
} from './types';
import { HttpClientError, getBlob, postJson } from './utils';

function toPreviewPath(request: PreviewRequest): string {
  const { font_id, ...params } = request;
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `/fonts/preview/${font_id}?${queryString}` : `/fonts/preview/${font_id}`;
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

export function registerFontIpcHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.font.generate);
  ipcMain.removeHandler(IPC_CHANNELS.font.subset);
  ipcMain.removeHandler(IPC_CHANNELS.font.convert);
  ipcMain.removeHandler(IPC_CHANNELS.font.preview);

  // Handles font generation request by forwarding to POST /fonts/generate.
  ipcMain.handle(IPC_CHANNELS.font.generate, async (_event, request: GenerateFontRequest) => {
    console.info('[font.ipc] font:generate', { glyph_count: request.glyphs?.length ?? 0 });
    try {
      return await postJson<GenerateFontResponse>('/fonts/generate', request);
    } catch (error) {
      logAndThrow(IPC_CHANNELS.font.generate, error);
    }
  });

  // Handles font subsetting request by forwarding to POST /fonts/subset.
  ipcMain.handle(IPC_CHANNELS.font.subset, async (_event, request: SubsetRequest) => {
    console.info('[font.ipc] font:subset', {
      has_font_id: Boolean(request.font_id),
      has_file_b64: Boolean(request.file_b64),
    });
    try {
      return await postJson<SubsetResponse>('/fonts/subset', request);
    } catch (error) {
      logAndThrow(IPC_CHANNELS.font.subset, error);
    }
  });

  // Handles font conversion request by forwarding to POST /fonts/convert.
  ipcMain.handle(IPC_CHANNELS.font.convert, async (_event, request: ConvertRequest) => {
    console.info('[font.ipc] font:convert', {
      has_font_id: Boolean(request.font_id),
      family_name: request.family_name,
    });
    try {
      return await postJson<ConvertResponse>('/fonts/convert', request);
    } catch (error) {
      logAndThrow(IPC_CHANNELS.font.convert, error);
    }
  });

  // Handles font preview request by forwarding to GET /fonts/preview/{id}.
  ipcMain.handle(IPC_CHANNELS.font.preview, async (_event, request: PreviewRequest) => {
    console.info('[font.ipc] font:preview', { font_id: request.font_id, type: request.type });
    try {
      return await getBlob(toPreviewPath(request));
    } catch (error) {
      logAndThrow(IPC_CHANNELS.font.preview, error);
    }
  });

  console.info('[font.ipc] registered font IPC handlers');
}
