import { useState } from 'react';

interface Props {
  onExport: (name: string) => Promise<void>;
}

export function ExportDialog({ onExport }: Props) {
  const [name, setName] = useState('GeneratedScreen');

  return (
    <div className="card">
      <h3>Export</h3>
      <div className="row">
        <input value={name} onChange={(event) => setName(event.target.value)} />
        <button type="button" onClick={() => void onExport(name)}>
          Export JSX/CSS
        </button>
      </div>
    </div>
  );
}
