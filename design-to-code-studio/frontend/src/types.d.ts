/// <reference types="vite/client" />

import type { AnalyzeResponse, GenerateCodeResponse, UploadResponse } from '../../../shared/types/design';
import type {
  FontConvertRequest,
  FontConvertResponse,
  FontGenerateRequest,
  FontGenerateResponse,
} from '../../../shared/types/font';
import type { CreateProjectInput, ProjectRecord, UpdateProjectInput } from '../../../shared/types/project';

declare global {
  interface Window {
    designAPI?: {
      uploadDesign?: (file: File, projectId?: string) => Promise<UploadResponse>;
      analyzeDesign?: (projectId: string) => Promise<AnalyzeResponse>;
      generateJsx?: (analysisId: string, componentName?: string) => Promise<GenerateCodeResponse>;
      exportCode?: (name: string, jsx: string, css: string) => Promise<{ path: string }>;
      listProjects?: () => Promise<ProjectRecord[]>;
      getProject?: (projectId: string) => Promise<ProjectRecord>;
      createProject?: (input: CreateProjectInput) => Promise<ProjectRecord>;
      updateProject?: (projectId: string, input: UpdateProjectInput) => Promise<ProjectRecord>;
      deleteProject?: (projectId: string) => Promise<void>;
      generateFont?: (request: FontGenerateRequest) => Promise<FontGenerateResponse>;
      convertFont?: (request: FontConvertRequest) => Promise<FontConvertResponse>;
    };
  }
}

export {};
