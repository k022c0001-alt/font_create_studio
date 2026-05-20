import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';
import { deleteJson, getJson, patchJson, postJson } from './httpClient';
const API_BASE_URL = process.env.DESIGN_API_BASE_URL || 'http://localhost:8010';
export function registerProjectIpcHandlers() {
    ipcMain.removeHandler(IPC_CHANNELS.projects.list);
    ipcMain.removeHandler(IPC_CHANNELS.projects.get);
    ipcMain.removeHandler(IPC_CHANNELS.projects.create);
    ipcMain.removeHandler(IPC_CHANNELS.projects.update);
    ipcMain.removeHandler(IPC_CHANNELS.projects.delete);
    ipcMain.handle(IPC_CHANNELS.projects.list, async () => getJson(`${API_BASE_URL}/projects`));
    ipcMain.handle(IPC_CHANNELS.projects.get, async (_event, projectId) => getJson(`${API_BASE_URL}/projects/${projectId}`));
    ipcMain.handle(IPC_CHANNELS.projects.create, async (_event, payload) => postJson(`${API_BASE_URL}/projects`, payload));
    ipcMain.handle(IPC_CHANNELS.projects.update, async (_event, payload) => patchJson(`${API_BASE_URL}/projects/${payload.projectId}`, payload.input));
    ipcMain.handle(IPC_CHANNELS.projects.delete, async (_event, projectId) => {
        await deleteJson(`${API_BASE_URL}/projects/${projectId}`);
    });
}
