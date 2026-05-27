import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { registerIpcHandlers } from './ipc/index';
import { initHttpClient } from './ipc/utils';
import { isDev } from './utils/isDev';

let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1100,
    minHeight: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5180';
    await mainWindow.loadURL(devUrl);
    return;
  }

  await mainWindow.loadFile(path.join(__dirname, '../dist/frontend/index.html'));
}

app.whenReady().then(async () => {
  const fontApiBaseUrl = process.env.FONT_API_BASE_URL || process.env.DESIGN_FONT_API_BASE_URL || 'http://localhost:8000';
  const timeoutMs = Number(process.env.FONT_API_TIMEOUT_MS ?? 30_000);
  const retries = Number(process.env.FONT_API_RETRIES ?? 2);
  const normalizedTimeoutMs = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 30_000;
  const normalizedRetries = Number.isFinite(retries) && retries >= 0 ? retries : 2;

  try {
    initHttpClient({
      baseUrl: fontApiBaseUrl,
      timeoutMs: normalizedTimeoutMs,
      retries: normalizedRetries,
    });
    console.info('[main] Font HTTP client initialized', { fontApiBaseUrl });
  } catch (error) {
    console.error('[main] Failed to initialize Font HTTP client', error);
    app.quit();
    return;
  }

  registerIpcHandlers();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
