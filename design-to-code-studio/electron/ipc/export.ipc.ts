import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';

// Export IPC handlers
export function registerExportIpc(): void {
  ipcMain.handle(IPC_CHANNELS.export?.zip, async (_event, params) => {
    // TODO: trigger ZIP export via Python backend
  });
}
