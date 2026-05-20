import { create } from 'zustand';
export const useDesignStore = create((set) => ({
    projects: [],
    isLoading: false,
    setProjects: (projects) => set({ projects }),
    setCurrentProject: (currentProject) => set({ currentProject }),
    setUpload: (upload) => set({ upload }),
    setAnalysis: (analysis) => set({ analysis }),
    setGenerated: (generated) => set({ generated }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setExportPath: (exportPath) => set({ exportPath }),
    resetWorkspace: () => set({ upload: undefined, analysis: undefined, generated: undefined, exportPath: undefined, error: undefined }),
}));
