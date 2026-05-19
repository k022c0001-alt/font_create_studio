import { AnalysisPreview } from '../components/AnalysisPreview';
import { CodeEditor } from '../components/CodeEditor';
import { ExportDialog } from '../components/ExportDialog';
import { ImageUploader } from '../components/ImageUploader';
import { electronAPI } from '../api/electronAPI';
import { useDesignStore } from '../store/designStore';

export function DesignConverter() {
  const { upload, analysis, generated, isLoading, error, setUpload, setAnalysis, setGenerated, setLoading, setError } = useDesignStore();

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(undefined);
      const uploaded = await electronAPI.upload(file);
      setUpload(uploaded);
      const analyzed = await electronAPI.analyze(uploaded.project_id);
      setAnalysis(analyzed);
      const code = await electronAPI.generate(analyzed.analysis_id);
      setGenerated(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (name: string) => {
    if (!generated) return;
    await electronAPI.exportCode(name, generated.jsx, generated.css);
  };

  return (
    <main className="container">
      <h1>Design-to-Code Studio</h1>
      <p>Upload Figma screenshot, analyze with Claude Vision, generate JSX/CSS.</p>
      <ImageUploader onFile={(file) => void handleUpload(file)} />
      {upload ? <p>Project: {upload.project_id}</p> : null}
      {isLoading ? <p>Processing...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <AnalysisPreview analysis={analysis} />
      <CodeEditor jsx={generated?.jsx} css={generated?.css} />
      <ExportDialog onExport={handleExport} />
    </main>
  );
}
