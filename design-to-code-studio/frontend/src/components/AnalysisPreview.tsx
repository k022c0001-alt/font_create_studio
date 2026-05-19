import type { AnalyzeResponse } from '../../../shared/types/design';

interface Props {
  analysis?: AnalyzeResponse;
}

export function AnalysisPreview({ analysis }: Props) {
  if (!analysis) return <div className="card">No analysis yet.</div>;

  return (
    <div className="card">
      <h3>Analysis Preview</h3>
      <p>{analysis.layout_summary}</p>
      <div className="preview-canvas">
        {analysis.elements.map((element) => (
          <div
            key={element.id}
            className="overlay"
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
            }}
          >
            {element.type}
          </div>
        ))}
      </div>
    </div>
  );
}
