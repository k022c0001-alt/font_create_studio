import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { registerIpcHandlers } from './ipc/index';
import { isDev } from './utils/isDev';
let mainWindow = null;
async function createWindow() {
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
