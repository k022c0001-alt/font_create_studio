import { app, ipcMain } from 'electron';
import path from 'node:path';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';
import { postJson } from './httpClient';
import { writeCodeBundle } from '../utils/fileManager';
const API_BASE_URL = process.env.DESIGN_API_BASE_URL || 'http://localhost:8010';
export function registerCodeGenIpcHandlers() {
    ipcMain.removeHandler(IPC_CHANNELS.codeGen.generateJsx);
    ipcMain.removeHandler(IPC_CHANNELS.codeGen.exportFiles);
    ipcMain.handle(IPC_CHANNELS.codeGen.generateJsx, async (_event, payload) => {
        return postJson(`${API_BASE_URL}/design/generate-jsx`, {
            analysis_id: payload.analysisId,
            component_name: payload.componentName || 'GeneratedScreen',
            stream: false,
        });
    });
    ipcMain.handle(IPC_CHANNELS.codeGen.exportFiles, async (_event, payload) => {
        const exportDir = path.join(app.getPath('downloads'), 'design-to-code-export');
        const target = await writeCodeBundle(exportDir, payload.name, payload.jsx, payload.css);
        return { path: target };
    });
}
