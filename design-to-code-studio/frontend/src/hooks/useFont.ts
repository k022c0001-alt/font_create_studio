import { useCallback } from 'react';
import type {
  FontConvertResponse,
  FontGenerateRequest,
  FontGenerateResponse,
} from '../../../shared/types/font';
import { electronAPI } from '../api/electronAPI';
import type { FontEntry } from '../store/fontStore';
import { useFontStore } from '../store/fontStore';

function upsertFont(fonts: FontEntry[], next: FontEntry): FontEntry[] {
  const index = fonts.findIndex((font) => font.id === next.id);
  if (index === -1) {
    return [...fonts, next];
  }
  return [...fonts.slice(0, index), next, ...fonts.slice(index + 1)];
}

function toGeneratedFontEntry(response: FontGenerateResponse): FontEntry | null {
  if (!response.font_id) {
    return null;
  }
  return {
    id: response.font_id,
    family: response.family_name || 'Generated Font',
    filePath: response.file_path || '',
    format: response.format || 'ttf',
  };
}

function toConvertedFontEntry(response: FontConvertResponse, fallback: FontEntry | undefined): FontEntry | null {
  if (!response.font_id && !fallback?.id) {
    return null;
  }
  return {
    id: response.font_id || fallback?.id || '',
    family: response.family_name || fallback?.family || 'Converted Font',
    filePath: response.file_path || fallback?.filePath || '',
    format: response.format || 'woff2',
  };
}

/** Hook for font generation and woff2 conversion. */
export function useFont() {
  const { fonts } = useFontStore();

  const generateFont = useCallback(async (params: FontGenerateRequest) => {
    try {
      const result = await electronAPI.generateFont(params);
      const entry = toGeneratedFontEntry(result);
      if (entry) {
        useFontStore.setState((state) => ({ fonts: upsertFont(state.fonts, entry) }));
      }
      return result;
    } catch (error) {
      console.error('[useFont] Failed to generate font', error);
      throw error;
    }
  }, []);

  const convertToWoff2 = useCallback(async (fontId: string) => {
    try {
      const result = await electronAPI.convertFont({ fontId });
      useFontStore.setState((state) => {
        const fallback = state.fonts.find((font) => font.id === fontId);
        const entry = toConvertedFontEntry(result, fallback);
        if (!entry) {
          return state;
        }
        return { fonts: upsertFont(state.fonts, entry) };
      });
      return result;
    } catch (error) {
      console.error('[useFont] Failed to convert font', error);
      throw error;
    }
  }, []);

  return { fonts, generateFont, convertToWoff2 };
}
