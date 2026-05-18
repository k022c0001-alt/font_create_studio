import { create } from 'zustand';

import type { FontMetrics, GlyphDefinition, StrokeParams } from '../../../shared/types/font';

interface FontMetadataState {
  family_name: string;
  style_name: string;
  version: string;
}

interface FontStoreState {
  metadata: FontMetadataState;
  metrics: FontMetrics;
  stroke: StrokeParams;
  glyphs: GlyphDefinition[];
  generatedFontId: string | null;
  previewUrl: string | null;
  setMetadata: (patch: Partial<FontMetadataState>) => void;
  setMetrics: (metrics: FontMetrics) => void;
  setStroke: (stroke: StrokeParams) => void;
  setGlyphs: (glyphs: GlyphDefinition[]) => void;
  setGeneratedFontId: (fontId: string | null) => void;
  setPreviewUrl: (previewUrl: string | null) => void;
}

const DEFAULT_METRICS: FontMetrics = {
  upm: 1000,
  ascender: 800,
  descender: -200,
  cap_height: 700,
  x_height: 520,
  line_gap: 0,
};

const DEFAULT_STROKE: StrokeParams = {
  weight: 80,
  cap_style: 'round',
  join_style: 'round',
};

const DEFAULT_GLYPHS: GlyphDefinition[] = [
  {
    name: 'O',
    unicode: 79,
    shape: 'preset:O',
    advance_width: 600,
    lsb: 0,
    stroke: DEFAULT_STROKE,
  },
  {
    name: 'I',
    unicode: 73,
    shape: 'preset:I',
    advance_width: 600,
    lsb: 0,
    stroke: DEFAULT_STROKE,
  },
];

export const useFontStore = create<FontStoreState>((set) => ({
  metadata: {
    family_name: 'NewFont',
    style_name: 'Regular',
    version: '1.0.0',
  },
  metrics: DEFAULT_METRICS,
  stroke: DEFAULT_STROKE,
  glyphs: DEFAULT_GLYPHS,
  generatedFontId: null,
  previewUrl: null,
  setMetadata: (patch) => set((state) => ({ metadata: { ...state.metadata, ...patch } })),
  setMetrics: (metrics) => set({ metrics }),
  setStroke: (stroke) => set({ stroke }),
  setGlyphs: (glyphs) => set({ glyphs }),
  setGeneratedFontId: (generatedFontId) => set({ generatedFontId }),
  setPreviewUrl: (previewUrl) => set({ previewUrl }),
}));
