import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';
import { deleteJson, getJson, patchJson, postJson } from './httpClient';
import type { CreateProjectInput, ProjectRecord, UpdateProjectInput } from '../../shared/types/project';

const API_BASE_URL = process.env.DESIGN_API_BASE_URL || 'http://localhost:8010';

export function registerProjectIpcHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.projects.list);
  ipcMain.removeHandler(IPC_CHANNELS.projects.get);
  ipcMain.removeHandler(IPC_CHANNELS.projects.create);
  ipcMain.removeHandler(IPC_CHANNELS.projects.update);
  ipcMain.removeHandler(IPC_CHANNELS.projects.delete);

  ipcMain.handle(IPC_CHANNELS.projects.list, async () => getJson<ProjectRecord[]>(`${API_BASE_URL}/projects`));
  ipcMain.handle(IPC_CHANNELS.projects.get, async (_event, projectId: string) => getJson<ProjectRecord>(`${API_BASE_URL}/projects/${projectId}`));
  ipcMain.handle(
    IPC_CHANNELS.projects.create,
    async (_event, payload: CreateProjectInput) => postJson<ProjectRecord>(`${API_BASE_URL}/projects`, payload),
  );
  ipcMain.handle(
    IPC_CHANNELS.projects.update,
    async (_event, payload: { projectId: string; input: UpdateProjectInput }) =>
      patchJson<ProjectRecord>(`${API_BASE_URL}/projects/${payload.projectId}`, payload.input),
  );
  ipcMain.handle(IPC_CHANNELS.projects.delete, async (_event, projectId: string) => {
    await deleteJson(`${API_BASE_URL}/projects/${projectId}`);
  });
}
