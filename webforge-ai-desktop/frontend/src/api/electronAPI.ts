import type {
  ConvertRequest,
  ConvertResponse,
  GenerateFontRequest,
  GenerateFontResponse,
  PreviewRequest,
  SubsetRequest,
  SubsetResponse,
} from '../../../shared/types/font';

export const electronAPI = {
  font: {
    generate: async (request: GenerateFontRequest): Promise<GenerateFontResponse> => {
      if (!window.electronAPI?.generateFont) {
        throw new Error('Font IPC is not available');
      }
      return window.electronAPI.generateFont(request);
    },
    subset: async (request: SubsetRequest): Promise<SubsetResponse> => {
      if (!window.electronAPI?.subsetFont) {
        throw new Error('Font IPC is not available');
      }
      return window.electronAPI.subsetFont(request);
    },
    convert: async (request: ConvertRequest): Promise<ConvertResponse> => {
      if (!window.electronAPI?.convertFont) {
        throw new Error('Font IPC is not available');
      }
      return window.electronAPI.convertFont(request);
    },
    preview: async (request: PreviewRequest): Promise<Blob> => {
      if (!window.electronAPI?.previewFont) {
        throw new Error('Font IPC is not available');
      }
      return window.electronAPI.previewFont(request);
    },
  },
};
