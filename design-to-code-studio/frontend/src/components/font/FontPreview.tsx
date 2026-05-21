import React from 'react';

/** Real-time font preview component. */
export const FontPreview: React.FC<{ fontFamily: string; text?: string }> = ({
  fontFamily,
  text = 'The quick brown fox jumps over the lazy dog',
}) => {
  return (
    <div className="font-preview" style={{ fontFamily }}>
      {text}
    </div>
  );
};
