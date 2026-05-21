import { useEffect } from 'react';

interface FontFaceEntry {
  family: string;
  src: string;
  weight?: string;
  style?: string;
}

/** Dynamically registers @font-face rules in the document. */
export function useDynamicFont(entries: FontFaceEntry[]): void {
  useEffect(() => {
    const styleId = 'dynamic-font-faces';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = entries
      .map(
        (e) =>
          `@font-face { font-family: '${e.family}'; src: ${e.src};${
            e.weight ? ` font-weight: ${e.weight};` : ''
          }${e.style ? ` font-style: ${e.style};` : ''} }`,
      )
      .join('\n');

    return () => {
      style?.remove();
    };
  }, [entries]);
}
