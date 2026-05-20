import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/ipcChannels';
contextBridge.exposeInMainWorld('designAPI', {
    uploadDesign: async (file, projectId) => {
        const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
        return ipcRenderer.invoke(IPC_CHANNELS.design.upload, {
            name: file.name,
            type: file.type,
            bytes,
            projectId,
        });
    },
    analyzeDesign: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.design.analyze, projectId),
    generateJsx: (analysisId, componentName) => ipcRenderer.invoke(IPC_CHANNELS.codeGen.generateJsx, { analysisId, componentName }),
    exportCode: (name, jsx, css) => ipcRenderer.invoke(IPC_CHANNELS.codeGen.exportFiles, { name, jsx, css }),
    listProjects: () => ipcRenderer.invoke(IPC_CHANNELS.projects.list),
    getProject: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.projects.get, projectId),
    createProject: (input) => ipcRenderer.invoke(IPC_CHANNELS.projects.create, input),
    updateProject: (projectId, input) => ipcRenderer.invoke(IPC_CHANNELS.projects.update, { projectId, input }),
    deleteProject: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.projects.delete, projectId),
});
