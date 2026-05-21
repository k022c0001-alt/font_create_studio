import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';

// Project CRUD IPC handlers
export function registerProjectIpc(): void {
  ipcMain.handle(IPC_CHANNELS.projects.list, async () => {
    // TODO: list all projects
  });

  ipcMain.handle(IPC_CHANNELS.projects.create, async (_event, input) => {
    // TODO: create a new project
  });

  ipcMain.handle(IPC_CHANNELS.projects.update, async (_event, input) => {
    // TODO: update an existing project
  });

  ipcMain.handle(IPC_CHANNELS.projects.delete, async (_event, id: string) => {
    // TODO: delete a project by id
  });
}
