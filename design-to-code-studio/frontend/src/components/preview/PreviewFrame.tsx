import React from 'react';

/** WebView / iframe wrapper for the live preview. */
export const PreviewFrame: React.FC<{ src: string }> = ({ src }) => {
  return (
    <iframe
      className="preview-frame"
      src={src}
      title="Site preview"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};
