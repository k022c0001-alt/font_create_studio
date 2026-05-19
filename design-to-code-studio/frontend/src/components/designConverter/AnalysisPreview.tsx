import type { AnalyzeResponse } from '../../../../shared/types/design';

interface AnalysisPreviewProps {
  analysis?: AnalyzeResponse;
}

export function AnalysisPreview({ analysis }: AnalysisPreviewProps) {
  return (
    <section className="panel preview">
      <div className="preview__header">
        <div>
          <p className="section-label">2. Analysis preview</p>
          <h3>Detected layout</h3>
        </div>
        <p>{analysis?.source === 'claude_vision' ? 'Claude Vision' : 'Fallback analyzer'}</p>
      </div>

      <p className="preview__summary">{analysis?.layout_summary || '画像解析後にレイアウト要約が表示されます。'}</p>
      <div className="preview__canvas">
        {analysis?.elements?.length ? (
          analysis.elements.map((element) => (
            <div
              key={element.id}
              className="preview__element"
              style={{ left: element.x, top: element.y, width: element.width, height: element.height }}
            >
              <span>{element.type}</span>
            </div>
          ))
        ) : (
          <div className="preview__empty">No analysis yet</div>
        )}
      </div>
    </section>
  );
}
