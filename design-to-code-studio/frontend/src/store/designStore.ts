import { create } from 'zustand';
import type { AnalyzeResponse, GenerateCodeResponse, UploadResponse } from '../../../shared/types/design';

interface DesignStore {
  upload?: UploadResponse;
  analysis?: AnalyzeResponse;
  generated?: GenerateCodeResponse;
  isLoading: boolean;
  error?: string;
  setUpload: (upload: UploadResponse) => void;
  setAnalysis: (analysis: AnalyzeResponse) => void;
  setGenerated: (generated: GenerateCodeResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
}

export const useDesignStore = create<DesignStore>((set) => ({
  isLoading: false,
  setUpload: (upload) => set({ upload }),
  setAnalysis: (analysis) => set({ analysis }),
  setGenerated: (generated) => set({ generated }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
