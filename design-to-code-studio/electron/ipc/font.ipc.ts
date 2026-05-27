import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';
import type {
  FontConvertRequest,
  FontConvertResponse,
  FontGenerateRequest,
  FontGenerateResponse,
} from '../../shared/types/font';
import { HttpClientError, postJson } from './utils';

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

  console.info('[font.ipc] registered font IPC handlers');
}
