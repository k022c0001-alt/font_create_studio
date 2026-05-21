import React from 'react';

/** Card component displaying a single font entry. */
export const FontCard: React.FC<{ name: string }> = ({ name }) => {
  return <div className="font-card">{name}</div>;
};
