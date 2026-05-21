import { create } from 'zustand';

export interface FontEntry {
  id: string;
  family: string;
  filePath: string;
  format: 'ttf' | 'otf' | 'woff2';
}

interface FontStore {
  fonts: FontEntry[];
  selectedFont: FontEntry | null;
  setFonts: (fonts: FontEntry[]) => void;
  setSelectedFont: (font: FontEntry | null) => void;
}

export const useFontStore = create<FontStore>((set) => ({
  fonts: [],
  selectedFont: null,
  setFonts: (fonts) => set({ fonts }),
  setSelectedFont: (selectedFont) => set({ selectedFont }),
}));
