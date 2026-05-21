import React from 'react';

/** Overlay that renders AI-generated annotation bubbles on the preview. */
export const AnnotationOverlay: React.FC<{
  annotations?: Array<{ id: string; x: number; y: number; text: string }>;
}> = ({ annotations = [] }) => {
  return (
    <div className="annotation-overlay">
      {annotations.map((a) => (
        <div
          key={a.id}
          className="annotation-bubble"
          style={{ left: a.x, top: a.y }}
        >
          {a.text}
        </div>
      ))}
    </div>
  );
};
