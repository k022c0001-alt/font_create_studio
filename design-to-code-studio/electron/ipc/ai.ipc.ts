import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';

// AI / LLM chat and generation IPC handlers
export function registerAiIpc(): void {
  ipcMain.handle(IPC_CHANNELS.ai?.chat, async (_event, params) => {
    // TODO: forward chat message to LLM via Python backend
  });

  ipcMain.handle(IPC_CHANNELS.ai?.generate, async (_event, params) => {
    // TODO: trigger site generation via Python backend
  });
}
