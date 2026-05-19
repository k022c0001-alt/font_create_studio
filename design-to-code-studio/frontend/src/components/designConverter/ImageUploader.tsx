interface ImageUploaderProps {
  onFile: (file: File) => void;
  projectName?: string;
  disabled?: boolean;
}

export function ImageUploader({ onFile, projectName, disabled }: ImageUploaderProps) {
  const handleFiles = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (file && !disabled) {
      onFile(file);
    }
  };

  return (
    <section className="panel uploader">
      <div>
        <p className="section-label">1. Upload design image</p>
        <h3>{projectName ? `${projectName} に画像を追加` : '新しいデザインを読み込む'}</h3>
        <p>Figma のスクリーンショットや UI 画像をアップロードすると、Claude Vision で解析して JSX/CSS を生成します。</p>
      </div>

      <label
        className={`uploader__dropzone${disabled ? ' uploader__dropzone--disabled' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
      >
        <input type="file" accept="image/*" disabled={disabled} onChange={(event) => handleFiles(event.target.files)} />
        <span>ドラッグ＆ドロップ、またはクリックして画像を選択</span>
      </label>
    </section>
  );
}
