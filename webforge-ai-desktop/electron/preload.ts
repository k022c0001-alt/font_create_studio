import { contextBridge, ipcRenderer } from 'electron';

// Define IPC channels
const IPC_CHANNELS = {
  PROJECT: {
    CREATE: 'project:create',
    READ: 'project:read',
    UPDATE: 'project:update',
    DELETE: 'project:delete',
    LIST: 'project:list',
  },
  FONT: {
    GENERATE: 'font:generate',
    CONVERT: 'font:convert',
    SUBSET: 'font:subset',
    PREVIEW: 'font:preview',
  },
  AI: {
    CHAT: 'ai:chat',
    GENERATE: 'ai:generate',
  },
  PYTHON: {
    STATUS: 'python:status',
  },
};

// Expose secure API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Project operations
  createProject: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT.CREATE, data),
  readProject: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT.READ, id),
  updateProject: (id: string, data: any) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT.UPDATE, id, data),
  deleteProject: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT.DELETE, id),
  listProjects: () => ipcRenderer.invoke(IPC_CHANNELS.PROJECT.LIST),

  // Font operations
  generateFont: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.FONT.GENERATE, data),
  convertFont: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.FONT.CONVERT, data),
  subsetFont: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.FONT.SUBSET, data),
  previewFont: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.FONT.PREVIEW, data),

  // AI operations
  chatAI: (message: string) => ipcRenderer.invoke(IPC_CHANNELS.AI.CHAT, message),
  generateAI: (prompt: string) => ipcRenderer.invoke(IPC_CHANNELS.AI.GENERATE, prompt),

  // System status
  getPythonStatus: () => ipcRenderer.invoke(IPC_CHANNELS.PYTHON.STATUS),
});
