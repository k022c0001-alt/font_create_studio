import { useRef } from 'react';

interface Props {
  onFile: (file: File) => void;
}

export function ImageUploader({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="card dropzone"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <p>Drag & drop Figma screenshot here, or click to upload.</p>
    </div>
  );
}
