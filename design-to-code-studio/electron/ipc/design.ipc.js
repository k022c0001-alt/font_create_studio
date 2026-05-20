import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';
import { validateImageFile } from '../utils/fileManager';
import { postJson } from './httpClient';
const API_BASE_URL = process.env.DESIGN_API_BASE_URL || 'http://localhost:8010';
export function registerDesignIpcHandlers() {
    ipcMain.removeHandler(IPC_CHANNELS.design.upload);
    ipcMain.removeHandler(IPC_CHANNELS.design.analyze);
    ipcMain.handle(IPC_CHANNELS.design.upload, async (_event, payload) => {
        validateImageFile(payload.name);
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(payload.bytes)], { type: payload.type || 'application/octet-stream' });
        formData.append('file', blob, payload.name);
        if (payload.projectId) {
            formData.append('project_id', payload.projectId);
        }
        const response = await fetch(`${API_BASE_URL}/design/upload`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${await response.text()}`);
        }
        return (await response.json());
    });
    ipcMain.handle(IPC_CHANNELS.design.analyze, async (_event, projectId) => {
        return postJson(`${API_BASE_URL}/design/analyze`, { project_id: projectId });
    });
}
