import { contextBridge, ipcRenderer } from 'electron';
import type { CreateProjectInput, UpdateProjectInput } from '../shared/types/project';
import { IPC_CHANNELS } from '../shared/constants/ipcChannels';

contextBridge.exposeInMainWorld('designAPI', {
  uploadDesign: async (file: File, projectId?: string) => {
    const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
    return ipcRenderer.invoke(IPC_CHANNELS.design.upload, {
      name: file.name,
      type: file.type,
      bytes,
      projectId,
    });
  },
  analyzeDesign: (projectId: string) => ipcRenderer.invoke(IPC_CHANNELS.design.analyze, projectId),
  generateJsx: (analysisId: string, componentName?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.codeGen.generateJsx, { analysisId, componentName }),
  exportCode: (name: string, jsx: string, css: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.codeGen.exportFiles, { name, jsx, css }),
  listProjects: () => ipcRenderer.invoke(IPC_CHANNELS.projects.list),
  getProject: (projectId: string) => ipcRenderer.invoke(IPC_CHANNELS.projects.get, projectId),
  createProject: (input: CreateProjectInput) => ipcRenderer.invoke(IPC_CHANNELS.projects.create, input),
  updateProject: (projectId: string, input: UpdateProjectInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.projects.update, { projectId, input }),
  deleteProject: (projectId: string) => ipcRenderer.invoke(IPC_CHANNELS.projects.delete, projectId),
});
