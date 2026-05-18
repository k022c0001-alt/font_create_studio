import { useCallback, useEffect, useMemo, useState } from 'react';

import GlyphEditor from '../components/font/GlyphEditor';
import MetricsPanel from '../components/font/MetricsPanel';
import StrokeEditor from '../components/font/StrokeEditor';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import { useFont } from '../hooks/useFont';
import { useFontStore } from '../store';

const PREVIEW_FONT_SIZE_DIVISOR = 3;
const DEFAULT_PREVIEW_STROKE_WEIGHT = 80;
const MIN_PREVIEW_FONT_SIZE = 14;

/** Main font creation workspace integrating metrics, stroke, glyph, preview and export actions. */
export default function FontStudio() {
  const {
    metadata,
    metrics,
    stroke,
    glyphs,
    generatedFontId,
    previewUrl,
    setMetadata,
    setMetrics,
    setStroke,
    setGlyphs,
    setGeneratedFontId,
    setPreviewUrl,
  } = useFontStore();

  const { loading, error, generate, preview, convert } = useFont();
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const previewGlyphNames = useMemo(() => glyphs.map((glyph) => glyph.name || '?').join(' '), [glyphs]);
  const previewFontSize = Math.max(
    MIN_PREVIEW_FONT_SIZE,
    (stroke.weight ?? DEFAULT_PREVIEW_STROKE_WEIGHT) / PREVIEW_FONT_SIZE_DIVISOR,
  );

  const handleGenerate = useCallback(async () => {
    try {
      const response = await generate({
        metadata,
        metrics,
        glyphs: glyphs.map((glyph) => ({ ...glyph, stroke })),
        output_format: 'ttf',
      });
      setGeneratedFontId(response.font_id);
      setToast({ message: 'Font generated successfully', variant: 'success' });
    } catch {
      setToast({ message: 'Failed to generate font', variant: 'error' });
    }
  }, [generate, glyphs, metadata, metrics, setGeneratedFontId, stroke]);

  const handlePreview = async () => {
    if (!generatedFontId) {
      setToast({ message: 'Generate a font first', variant: 'error' });
      return;
    }

    try {
      const blob = await preview({
        font_id: generatedFontId,
        type: 'sample',
        text: previewGlyphNames || 'Abc',
      });
      const nextUrl = URL.createObjectURL(blob);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(nextUrl);
      setToast({ message: 'Preview updated', variant: 'success' });
    } catch {
      setToast({ message: 'Failed to render preview', variant: 'error' });
    }
  };

  const handleConvert = async () => {
    if (!generatedFontId) {
      setToast({ message: 'Generate a font first', variant: 'error' });
      return;
    }

    try {
      await convert({
        font_id: generatedFontId,
        family_name: metadata.family_name,
        style_name: metadata.style_name,
        output_format: 'woff2',
      });
      setToast({ message: 'WOFF2 export completed', variant: 'success' });
    } catch {
      setToast({ message: 'Failed to export font', variant: 'error' });
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void handleGenerate();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleGenerate]);

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h1 className="mb-3 text-xl font-semibold">Font Studio</h1>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="text-sm text-slate-700">
            <span className="mb-1 block font-medium">Font Name</span>
            <input
              type="text"
              value={metadata.family_name}
              className="w-full rounded border border-slate-300 px-3 py-2"
              onChange={(event) => setMetadata({ family_name: event.target.value })}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="mb-1 block font-medium">Style</span>
            <input
              type="text"
              value={metadata.style_name}
              className="w-full rounded border border-slate-300 px-3 py-2"
              onChange={(event) => setMetadata({ style_name: event.target.value })}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="mb-1 block font-medium">Version</span>
            <input
              type="text"
              value={metadata.version}
              className="w-full rounded border border-slate-300 px-3 py-2"
              onChange={(event) => setMetadata({ version: event.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[400px_minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <MetricsPanel metrics={metrics} onChange={setMetrics} />
          <StrokeEditor stroke={stroke} onChange={setStroke} />
        </div>

        <div className="min-h-0 overflow-auto">
          <GlyphEditor glyphs={glyphs} onChange={setGlyphs} />
        </div>

        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">Preview</h3>
          {previewUrl ? (
            <img src={previewUrl} alt="Font preview" className="w-full rounded border border-slate-200" />
          ) : (
              <div className="rounded border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                <div className="mb-2">Real-time text preview</div>
                <div
                  style={{
                    fontSize: `${previewFontSize}px`,
                    lineHeight: 1.4,
                  }}
                >
                  {previewGlyphNames || 'Abc'}
                </div>
              </div>
            )}

          <div className="space-y-2">
            <button
              type="button"
              className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              disabled={loading}
              onClick={() => void handleGenerate()}
            >
              {loading ? <Spinner /> : 'Generate Font'}
            </button>
            <button
              type="button"
              className="w-full rounded border px-3 py-2 text-sm"
              disabled={loading}
              onClick={() => void handlePreview()}
            >
              {loading ? <Spinner /> : 'Preview'}
            </button>
            <button
              type="button"
              className="w-full rounded border px-3 py-2 text-sm"
              disabled={loading}
              onClick={() => void handleConvert()}
            >
              {loading ? <Spinner /> : 'Export TTF/WOFF2'}
            </button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </div>

      {toast ? <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
