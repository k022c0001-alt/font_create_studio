import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/ipcChannels';

contextBridge.exposeInMainWorld('designAPI', {
  uploadDesign: async (file: File) => {
    const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
    return ipcRenderer.invoke(IPC_CHANNELS.design.upload, {
      name: file.name,
      type: file.type,
      bytes,
    });
  },
  analyzeDesign: (projectId: string) => ipcRenderer.invoke(IPC_CHANNELS.design.analyze, projectId),
  generateJsx: (analysisId: string) => ipcRenderer.invoke(IPC_CHANNELS.codeGen.generateJsx, analysisId),
  exportCode: (name: string, jsx: string, css: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.codeGen.exportFiles, { name, jsx, css }),
});
