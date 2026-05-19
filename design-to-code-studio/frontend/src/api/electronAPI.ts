import type { AnalyzeResponse, GenerateCodeResponse, UploadResponse } from '../../../shared/types/design';

export const electronAPI = {
  upload: (file: File): Promise<UploadResponse> => {
    if (!window.designAPI?.uploadDesign) throw new Error('uploadDesign IPC unavailable');
    return window.designAPI.uploadDesign(file);
  },
  analyze: (projectId: string): Promise<AnalyzeResponse> => {
    if (!window.designAPI?.analyzeDesign) throw new Error('analyzeDesign IPC unavailable');
    return window.designAPI.analyzeDesign(projectId);
  },
  generate: (analysisId: string): Promise<GenerateCodeResponse> => {
    if (!window.designAPI?.generateJsx) throw new Error('generateJsx IPC unavailable');
    return window.designAPI.generateJsx(analysisId);
  },
  exportCode: (name: string, jsx: string, css: string): Promise<{ path: string }> => {
    if (!window.designAPI?.exportCode) throw new Error('exportCode IPC unavailable');
    return window.designAPI.exportCode(name, jsx, css);
  },
};
