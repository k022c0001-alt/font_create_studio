import React from 'react';

export const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
};
