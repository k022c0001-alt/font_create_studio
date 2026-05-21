import React from 'react';

type Device = 'desktop' | 'tablet' | 'mobile';

/** Device viewport selector for the preview pane. */
export const DeviceSelector: React.FC<{
  value: Device;
  onChange: (device: Device) => void;
}> = ({ value, onChange }) => {
  const devices: Device[] = ['desktop', 'tablet', 'mobile'];
  return (
    <div className="device-selector">
      {devices.map((d) => (
        <button
          key={d}
          className={`device-btn${value === d ? ' device-btn--active' : ''}`}
          onClick={() => onChange(d)}
        >
          {d}
        </button>
      ))}
    </div>
  );
};
