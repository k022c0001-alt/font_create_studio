import { useEffect, useMemo, useState, type FC } from 'react';
import type { FontapplyGlyphMetrics } from '../../../shared/types/fontapply';
import { electronAPI } from '../api/electronAPI';
import { fromFontapplyGlyph, toFontapplyGlyph, type FontVariationParams, type GlyphData } from '../api/fontapplyAdapter';

const DEFAULT_VARIATION: FontVariationParams = {
  weight: 400,
  width: 100,
  slant: 0,
  roundness: 0,
};

function parseProjectId(input: string): number | undefined {
  if (!input.trim()) {
    return undefined;
  }
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeUnicode(input: string): string {
  return input.trim().toUpperCase();
}

/** Fontapply connection and glyph sync page. */
const FontStudio: FC = () => {
  const [unicode, setUnicode] = useState('0041');
  const [projectIdInput, setProjectIdInput] = useState('');
  const [variation, setVariation] = useState<FontVariationParams>(DEFAULT_VARIATION);
  const [health, setHealth] = useState<string>('未確認');
  const [supported, setSupported] = useState<string[]>([]);
  const [glyph, setGlyph] = useState<GlyphData | null>(null);
  const [metrics, setMetrics] = useState<FontapplyGlyphMetrics | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const projectId = useMemo(() => parseProjectId(projectIdInput), [projectIdInput]);

  const checkHealth = async () => {
    setError('');
    try {
      const result = await electronAPI.fontapply.health();
      setHealth(result.status || (result.ok ? 'ok' : 'connected'));
    } catch (err) {
      setHealth('接続失敗');
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const loadSupported = async () => {
    setError('');
    try {
      const result = await electronAPI.fontapply.supportedGlyphs();
      setSupported(result.supported || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const loadGlyph = async () => {
    setIsBusy(true);
    setError('');
    setMessage('');
    try {
      const normalizedUnicode = normalizeUnicode(unicode);
      const response = await electronAPI.fontapply.getGlyph({ unicode: normalizedUnicode, projectId });
      setGlyph(fromFontapplyGlyph(response.glyph));
      setMetrics(response.metrics || null);
      setMessage(`グリフ ${normalizedUnicode} を取得しました`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsBusy(false);
    }
  };

  const saveGlyph = async () => {
    if (!glyph) {
      setError('先にグリフを読み込んでください。');
      return;
    }

    setIsBusy(true);
    setError('');
    setMessage('');
    try {
      const normalizedUnicode = normalizeUnicode(unicode);
      const response = await electronAPI.fontapply.saveGlyph({
        unicode: normalizedUnicode,
        projectId,
        glyph: toFontapplyGlyph(glyph),
      });
      setGlyph(fromFontapplyGlyph(response.glyph));
      setMetrics(response.metrics || metrics);
      setMessage(`グリフ ${normalizedUnicode} を保存しました`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void checkHealth();
    void loadSupported();
  }, []);

  return (
    <div className="panel" style={{ display: 'grid', gap: '1rem' }}>
      <div>
        <p className="section-label">Fontapply backend</p>
        <h2 style={{ margin: 0 }}>Font Studio (External Fontapply)</h2>
        <p style={{ marginTop: '0.5rem' }}>状態: {health}</p>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <label>
          Unicode
          <input value={unicode} onChange={(event) => setUnicode(event.target.value)} placeholder="0041" />
        </label>
        <label>
          project_id (任意)
          <input
            value={projectIdInput}
            onChange={(event) => setProjectIdInput(event.target.value)}
            placeholder="未指定で共通領域"
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => void checkHealth()} disabled={isBusy}>
          接続確認
        </button>
        <button type="button" onClick={() => void loadSupported()} disabled={isBusy}>
          対応グリフ更新
        </button>
        <button type="button" onClick={() => void loadGlyph()} disabled={isBusy}>
          グリフ取得
        </button>
        <button type="button" onClick={() => void saveGlyph()} disabled={isBusy || !glyph}>
          グリフ保存
        </button>
      </div>

      <div>
        <p className="section-label">Parametric (future API boundary only)</p>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {(Object.keys(variation) as Array<keyof FontVariationParams>).map((key) => (
            <label key={key}>
              {key}
              <input
                type="number"
                value={variation[key]}
                onChange={(event) =>
                  setVariation((current) => ({
                    ...current,
                    [key]: Number(event.target.value),
                  }))
                }
              />
            </label>
          ))}
        </div>
      </div>

      {glyph ? (
        <label>
          Width
          <input
            type="number"
            value={glyph.width}
            onChange={(event) =>
              setGlyph((current) =>
                current
                  ? {
                      ...current,
                      width: Number(event.target.value),
                    }
                  : current,
              )
            }
          />
        </label>
      ) : null}

      <p style={{ margin: 0 }}>対応グリフ数: {supported.length}</p>

      {metrics ? (
        <pre style={{ margin: 0, overflow: 'auto' }}>{JSON.stringify(metrics, null, 2)}</pre>
      ) : null}

      {glyph ? <pre style={{ margin: 0, overflow: 'auto' }}>{JSON.stringify(glyph, null, 2)}</pre> : null}

      {message ? <p className="page-message">{message}</p> : null}
      {error ? <p className="page-error">{error}</p> : null}
    </div>
  );
};

export default FontStudio;
