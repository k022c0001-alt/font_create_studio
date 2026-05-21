import { useCallback } from 'react';
import { useFontStore } from '../store/fontStore';

/** Hook for font generation and woff2 conversion. */
export function useFont() {
  const { fonts, setFonts } = useFontStore();

  const generateFont = useCallback(async (params: unknown) => {
    // TODO: call electronAPI.generateFont(params) and update store
  }, []);

  const convertToWoff2 = useCallback(async (fontId: string) => {
    // TODO: call electronAPI.convertFont(fontId) and update store
  }, []);

  return { fonts, generateFont, convertToWoff2 };
}
