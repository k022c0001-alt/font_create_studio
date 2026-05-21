import { useState, useCallback } from 'react';

/** Hook for updating the live preview HTML. */
export function usePreview() {
  const [previewHtml, setPreviewHtml] = useState<string>('');

  const refreshPreview = useCallback(async (projectId: string) => {
    // TODO: fetch preview HTML from Python backend and update state
  }, []);

  return { previewHtml, refreshPreview };
}
