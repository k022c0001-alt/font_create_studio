import React from 'react';

interface FileDropZoneProps {
  accept?: string;
  onFileDrop: (files: FileList) => void;
  children?: React.ReactNode;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ accept, onFileDrop, children }) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files);
    }
  };

  return (
    <div
      className="file-drop-zone"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {children ?? <span>Drop files here</span>}
      <input
        type="file"
        accept={accept}
        className="file-drop-zone__input"
        onChange={(e) => e.target.files && onFileDrop(e.target.files)}
      />
    </div>
  );
};
