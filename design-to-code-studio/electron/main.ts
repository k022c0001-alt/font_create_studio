import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { registerDesignIpcHandlers } from './ipc/design.ipc';
import { registerCodeGenIpcHandlers } from './ipc/code-gen.ipc';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5180';
  mainWindow.loadURL(devUrl);
}

app.whenReady().then(() => {
  registerDesignIpcHandlers();
  registerCodeGenIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
