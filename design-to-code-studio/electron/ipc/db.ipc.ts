import { ipcMain } from 'electron';

// DB direct-access IPC handlers (lightweight queries)
export function registerDbIpc(): void {
  ipcMain.handle('db:query', async (_event, sql: string, params?: unknown[]) => {
    // TODO: execute lightweight SQLite query
  });
}
