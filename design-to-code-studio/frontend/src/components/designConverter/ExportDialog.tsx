import { useState } from 'react';

interface ExportDialogProps {
  disabled?: boolean;
  onExport: (name: string) => Promise<void>;
}

export function ExportDialog({ disabled, onExport }: ExportDialogProps) {
  const [name, setName] = useState('GeneratedScreen');

  return (
    <section className="panel modal-panel">
      <div>
        <p className="section-label">4. Export</p>
        <h3>Save component files</h3>
      </div>
      <div className="modal-panel__row">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Component name" />
        <button type="button" disabled={disabled} onClick={() => void onExport(name.trim() || 'GeneratedScreen')}>
          Export JSX/CSS
        </button>
      </div>
    </section>
  );
}
