import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';

// Font generation and conversion IPC handlers
export function registerFontIpc(): void {
  ipcMain.handle(IPC_CHANNELS.font?.generate, async (_event, params) => {
    // TODO: trigger font generation via Python backend
  });

  ipcMain.handle(IPC_CHANNELS.font?.convert, async (_event, params) => {
    // TODO: trigger woff2 conversion via Python backend
  });
}
