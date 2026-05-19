import type { AnalyzeResponse, GenerateCodeResponse, UploadResponse } from '../../../shared/types/design';

declare global {
  interface Window {
    designAPI?: {
      uploadDesign?: (file: File) => Promise<UploadResponse>;
      analyzeDesign?: (projectId: string) => Promise<AnalyzeResponse>;
      generateJsx?: (analysisId: string) => Promise<GenerateCodeResponse>;
      exportCode?: (name: string, jsx: string, css: string) => Promise<{ path: string }>;
    };
  }
}

export {};
