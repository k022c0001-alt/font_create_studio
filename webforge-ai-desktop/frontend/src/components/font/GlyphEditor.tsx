import { useEffect, useMemo, useState } from 'react';

import type { FontMetricsInput, GlyphRequest } from '../../../../shared/types/font';
import MetricsPanel from './MetricsPanel';
import StrokeEditor from './StrokeEditor';

export interface GlyphEditorProps {
  glyphs: GlyphRequest[];
  onAddGlyph: (glyph: GlyphRequest) => void;
  onUpdateGlyph: (index: number, glyph: GlyphRequest) => void;
  onRemoveGlyph: (index: number) => void;
  metrics?: FontMetricsInput;
  onMetricsChange?: (metrics: FontMetricsInput) => void;
}

const DEFAULT_GLYPH: GlyphRequest = {
  name: 'new-glyph',
  unicode: undefined,
  shape: '',
  advance_width: 600,
  lsb: 0,
};

function clampMin(value: number, min: number): number {
  return Number.isFinite(value) ? Math.max(min, value) : min;
}

function parseOptionalNumber(rawValue: string): number | undefined {
  if (rawValue.trim() === '') {
    return undefined;
  }

  const parsed = Number(rawValue);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function GlyphEditor({
  glyphs,
  onAddGlyph,
  onUpdateGlyph,
  onRemoveGlyph,
  metrics,
  onMetricsChange,
}: GlyphEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [useMetricsPreset, setUseMetricsPreset] = useState(false);

  useEffect(() => {
    if (glyphs.length === 0) {
      if (selectedIndex !== 0) {
        setSelectedIndex(0);
      }
      return;
    }

    if (selectedIndex > glyphs.length - 1) {
      setSelectedIndex(glyphs.length - 1);
    }
  }, [glyphs.length, selectedIndex]);

  const selectedGlyph = glyphs[selectedIndex];

  const previewMetrics = useMemo<Required<FontMetricsInput>>(
    () => ({
      upm: metrics?.upm ?? 1000,
      ascender: metrics?.ascender ?? 800,
      descender: metrics?.descender ?? -200,
      cap_height: metrics?.cap_height ?? 700,
      x_height: metrics?.x_height ?? 520,
      line_gap: metrics?.line_gap ?? 0,
    }),
    [metrics],
  );

  const ascender = previewMetrics.ascender;
  const descender = previewMetrics.descender;
  const viewBoxHeight = Math.max(1, ascender - descender);
  const advanceWidth = clampMin(selectedGlyph?.advance_width ?? 600, 0);
  const leftBearing = selectedGlyph?.lsb ?? 0;
  const viewBoxWidth = Math.max(220, advanceWidth + Math.max(leftBearing, 0) + 80);

  const updateSelectedGlyph = (patch: Partial<GlyphRequest>): void => {
    if (!selectedGlyph) {
      return;
    }

    onUpdateGlyph(selectedIndex, {
      ...selectedGlyph,
      ...patch,
    });
  };

  const handleAddGlyph = (): void => {
    onAddGlyph({
      ...DEFAULT_GLYPH,
      name: `glyph-${glyphs.length + 1}`,
    });
    setSelectedIndex(glyphs.length);
  };

  const handleRemoveGlyph = (): void => {
    if (!selectedGlyph) {
      return;
    }

    onRemoveGlyph(selectedIndex);
  };

  const moveGlyph = (direction: -1 | 1): void => {
    const targetIndex = selectedIndex + direction;
    if (targetIndex < 0 || targetIndex >= glyphs.length) {
      return;
    }

    const current = glyphs[selectedIndex];
    const target = glyphs[targetIndex];
    if (!current || !target) {
      return;
    }

    onUpdateGlyph(selectedIndex, target);
    onUpdateGlyph(targetIndex, current);
    setSelectedIndex(targetIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">グリフエディタ</h2>
        <button
          type="button"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          onClick={handleAddGlyph}
        >
          グリフを追加
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-3 rounded-lg border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-800">グリフ一覧</h3>
          <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
            {glyphs.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                グリフがありません。追加してください。
              </p>
            ) : (
              glyphs.map((glyph, index) => (
                <button
                  key={`${glyph.name}-${index}`}
                  type="button"
                  className={`w-full rounded-md border p-3 text-left text-sm transition ${
                    selectedIndex === index
                      ? 'border-blue-400 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="font-medium">{glyph.name || `glyph-${index + 1}`}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {glyph.unicode !== undefined ? `U+${glyph.unicode.toString(16).toUpperCase()}` : 'Unicode 未設定'}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedIndex === 0 || glyphs.length < 2}
              onClick={() => moveGlyph(-1)}
            >
              ↑ 上へ
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedIndex >= glyphs.length - 1 || glyphs.length < 2}
              onClick={() => moveGlyph(1)}
            >
              ↓ 下へ
            </button>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">SVG プレビュー</h3>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                <svg viewBox={`0 ${descender} ${viewBoxWidth} ${viewBoxHeight}`} className="h-72 w-full">
                  <line x1={0} y1={ascender} x2={viewBoxWidth} y2={ascender} stroke="#94a3b8" strokeWidth={8} />
                  <line x1={0} y1={0} x2={viewBoxWidth} y2={0} stroke="#cbd5e1" strokeWidth={5} />
                  <line x1={0} y1={descender} x2={viewBoxWidth} y2={descender} stroke="#cbd5e1" strokeWidth={5} />
                  <line x1={advanceWidth} y1={0} x2={advanceWidth} y2={ascender} stroke="#2563eb" strokeDasharray="20 14" strokeWidth={4} />

                  {selectedGlyph?.shape ? (
                    <g transform={`translate(${leftBearing} ${ascender}) scale(1 -1)`}>
                      <path
                        d={selectedGlyph.shape}
                        fill={selectedGlyph.stroke ? 'none' : '#0f172a'}
                        stroke={selectedGlyph.stroke ? '#0f172a' : 'none'}
                        strokeWidth={selectedGlyph.stroke?.weight ?? 0}
                        strokeLinecap={selectedGlyph.stroke?.cap_style}
                        strokeLinejoin={selectedGlyph.stroke?.join_style}
                      />
                    </g>
                  ) : (
                    <text x={12} y={ascender - 20} fill="#64748b" fontSize={60}>
                      shape を入力すると表示されます
                    </text>
                  )}
                </svg>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">グリフ基本情報</h3>
                <button
                  type="button"
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!selectedGlyph}
                  onClick={handleRemoveGlyph}
                >
                  グリフを削除
                </button>
              </div>

              {selectedGlyph ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-700 sm:col-span-2">
                    <span className="font-medium">name *</span>
                    <input
                      type="text"
                      required
                      value={selectedGlyph.name}
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                      onChange={(event) => updateSelectedGlyph({ name: event.target.value })}
                    />
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium">unicode</span>
                    <input
                      type="number"
                      min={0}
                      value={selectedGlyph.unicode ?? ''}
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                      onChange={(event) => updateSelectedGlyph({ unicode: parseOptionalNumber(event.target.value) })}
                    />
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium">lsb</span>
                    <input
                      type="number"
                      value={selectedGlyph.lsb ?? ''}
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                      onChange={(event) => updateSelectedGlyph({ lsb: parseOptionalNumber(event.target.value) })}
                    />
                  </label>

                  <label className="space-y-1 text-sm text-slate-700 sm:col-span-2">
                    <span className="font-medium">advance_width</span>
                    <input
                      type="number"
                      min={0}
                      value={selectedGlyph.advance_width ?? 0}
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                      onChange={(event) =>
                        updateSelectedGlyph({ advance_width: clampMin(parseOptionalNumber(event.target.value) ?? 0, 0) })
                      }
                    />
                  </label>

                  <label className="space-y-1 text-sm text-slate-700 sm:col-span-2">
                    <span className="font-medium">shape (SVG path)</span>
                    <textarea
                      value={selectedGlyph.shape ?? ''}
                      rows={6}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs"
                      onChange={(event) => updateSelectedGlyph({ shape: event.target.value })}
                    />
                  </label>
                </div>
              ) : (
                <p className="text-sm text-slate-500">グリフを選択してください。</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">ストローク設定</h3>
            <StrokeEditor
              value={selectedGlyph?.stroke}
              enabled={selectedGlyph !== undefined}
              onChange={(stroke) => updateSelectedGlyph({ stroke })}
            />
          </div>

          {onMetricsChange ? (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">メトリクス（プレビュー用）</h3>
              <MetricsPanel
                value={metrics}
                usePreset={useMetricsPreset}
                onTogglePreset={setUseMetricsPreset}
                onChangeMetrics={(next) => onMetricsChange(next ?? {})}
              />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default GlyphEditor;
