import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  return (
    <input
      type="color"
      className="color-picker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
