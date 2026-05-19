import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';
import { validateImageFile } from '../utils/fileManager';
import { postJson } from './httpClient';
import type { AnalyzeResponse, UploadResponse } from '../../shared/types/design';

const API_BASE_URL = process.env.DESIGN_API_BASE_URL || 'http://localhost:8010';

export function registerDesignIpcHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.design.upload);
  ipcMain.removeHandler(IPC_CHANNELS.design.analyze);

  ipcMain.handle(IPC_CHANNELS.design.upload, async (_event, payload: { name: string; type: string; bytes: number[] }) => {
    validateImageFile(payload.name);
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(payload.bytes)], { type: payload.type || 'application/octet-stream' });
    formData.append('file', blob, payload.name);

    const response = await fetch(`${API_BASE_URL}/design/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${await response.text()}`);
    }

    return (await response.json()) as UploadResponse;
  });

  ipcMain.handle(IPC_CHANNELS.design.analyze, async (_event, projectId: string) => {
    return postJson<AnalyzeResponse>(`${API_BASE_URL}/design/analyze`, { project_id: projectId });
  });
}
