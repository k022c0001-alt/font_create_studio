import type {
  ConvertRequest,
  ConvertResponse,
  GenerateFontRequest,
  GenerateFontResponse,
  PreviewRequest,
  SubsetRequest,
  SubsetResponse,
} from '../../../shared/types/font';

declare global {
  interface Window {
    electronAPI?: {
      generateFont?: (data: GenerateFontRequest) => Promise<GenerateFontResponse>;
      convertFont?: (data: ConvertRequest) => Promise<ConvertResponse>;
      subsetFont?: (data: SubsetRequest) => Promise<SubsetResponse>;
      previewFont?: (data: PreviewRequest) => Promise<Blob>;
      window?: {
        minimize?: () => void;
        maximize?: () => void;
        close?: () => void;
      };
    };
  }
}

export {};
