import type { GlyphDefinition } from '../../../../shared/types/font';

export interface GlyphEditorProps {
  glyphs: GlyphDefinition[];
  onChange: (glyphs: GlyphDefinition[]) => void;
}

const SHAPE_OPTIONS = ['preset:O', 'preset:I', 'rect', 'circle', 'stroke'] as const;
const DEFAULT_SHAPE: (typeof SHAPE_OPTIONS)[number] = 'preset:O';
const MAX_UNICODE_CODEPOINT = 0x10ffff;
const DEFAULT_UNICODE_START = 65;
const DEFAULT_UNICODE_RANGE = 26;

function parseOptionalNumber(rawValue: string): number | undefined {
  if (rawValue.trim() === '') {
    return undefined;
  }
  const parsed = Number(rawValue);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** Glyph list editor with add/remove and basic glyph fields. */
export function GlyphEditor({ glyphs, onChange }: GlyphEditorProps) {
  const updateGlyph = (index: number, patch: Partial<GlyphDefinition>) => {
    onChange(glyphs.map((glyph, currentIndex) => (currentIndex === index ? { ...glyph, ...patch } : glyph)));
  };

  const removeGlyph = (index: number) => {
    onChange(glyphs.filter((_, currentIndex) => currentIndex !== index));
  };

  const addGlyph = () => {
    onChange([
      ...glyphs,
      {
        name: `glyph-${glyphs.length + 1}`,
        unicode: DEFAULT_UNICODE_START + (glyphs.length % DEFAULT_UNICODE_RANGE),
        shape: DEFAULT_SHAPE,
        advance_width: 600,
        lsb: 0,
      },
    ]);
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Glyphs</h3>
        <button type="button" className="rounded border px-3 py-1 text-sm" onClick={addGlyph}>
          Add glyph
        </button>
      </div>

      <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
        {glyphs.map((glyph, index) => (
          <div key={`${glyph.name}-${index}`} className="rounded-md border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">#{index + 1}</span>
              <button
                type="button"
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                onClick={() => removeGlyph(index)}
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="text-sm text-slate-700 md:col-span-2">
                <span className="mb-1 block font-medium">name</span>
                <input
                  type="text"
                  value={glyph.name}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  onChange={(event) => updateGlyph(index, { name: event.target.value })}
                />
              </label>

              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">unicode</span>
                <input
                  type="number"
                  min={0}
                  max={MAX_UNICODE_CODEPOINT}
                  value={glyph.unicode ?? ''}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  onChange={(event) => updateGlyph(index, { unicode: parseOptionalNumber(event.target.value) })}
                />
              </label>

              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">shape</span>
                <select
                  value={glyph.shape ?? DEFAULT_SHAPE}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  onChange={(event) => updateGlyph(index, { shape: event.target.value })}
                >
                  {SHAPE_OPTIONS.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">advance_width</span>
                <input
                  type="number"
                  min={0}
                  value={glyph.advance_width ?? 0}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  onChange={(event) => updateGlyph(index, { advance_width: Number(event.target.value) || 0 })}
                />
              </label>

              <label className="text-sm text-slate-700">
                <span className="mb-1 block font-medium">lsb</span>
                <input
                  type="number"
                  value={glyph.lsb ?? 0}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  onChange={(event) => updateGlyph(index, { lsb: Number(event.target.value) || 0 })}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GlyphEditor;
