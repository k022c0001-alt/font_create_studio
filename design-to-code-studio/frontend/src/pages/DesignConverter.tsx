import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { electronAPI } from '../api/electronAPI';
import { AnalysisPreview } from '../components/designConverter/AnalysisPreview';
import { CodeEditor } from '../components/designConverter/CodeEditor';
import { ExportDialog } from '../components/designConverter/ExportDialog';
import { ImageUploader } from '../components/designConverter/ImageUploader';
import { useDesignStore } from '../store/designStore';

export function DesignConverter() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const {
    currentProject,
    analysis,
    generated,
    isLoading,
    error,
    setCurrentProject,
    setUpload,
    setAnalysis,
    setGenerated,
    setLoading,
    setError,
    setExportPath,
    resetWorkspace,
  } = useDesignStore();

  useEffect(() => {
    if (!projectId) {
      setCurrentProject(undefined);
      resetWorkspace();
      return;
    }

    void (async () => {
      try {
        const project = await electronAPI.projects.get(projectId);
        setCurrentProject(project);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [projectId, resetWorkspace, setCurrentProject, setError]);

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(undefined);
      setExportPath(undefined);
      const uploaded = await electronAPI.upload(file, projectId);
      setUpload(uploaded);
      const project = await electronAPI.projects.get(uploaded.project_id);
      setCurrentProject(project);
      if (uploaded.project_id !== projectId) {
        navigate(`/projects/${uploaded.project_id}`, { replace: true });
      }
      const analyzed = await electronAPI.analyze(uploaded.project_id);
      setAnalysis(analyzed);
      const componentName = (project.name || 'GeneratedScreen').replace(/[^a-zA-Z0-9]+/g, '') || 'GeneratedScreen';
      const code = await electronAPI.generate(analyzed.analysis_id, componentName);
      setGenerated(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (name: string) => {
    if (!generated) {
      return;
    }
    const result = await electronAPI.exportCode(name, generated.jsx, generated.css);
    setExportPath(result.path);
  };

  return (
    <section className="converter-page">
      <div className="converter-page__intro panel">
        <div>
          <p className="section-label">Workspace</p>
          <h1>{currentProject?.name || 'Design Converter'}</h1>
          <p>{currentProject?.image_path ? '既存プロジェクトを再解析できます。' : '画像をアップロードして新しい React コンポーネントを生成してください。'}</p>
        </div>
        {projectId ? <button type="button" className="button--ghost" onClick={() => navigate('/')}>ダッシュボードへ戻る</button> : null}
      </div>

      {error ? <p className="page-error">{error}</p> : null}
      {isLoading ? <p className="page-message">Processing design image…</p> : null}

      <ImageUploader onFile={(file) => void handleUpload(file)} projectName={currentProject?.name} disabled={isLoading} />
      <AnalysisPreview analysis={analysis} />
      <CodeEditor jsx={generated?.jsx} css={generated?.css} />
      <ExportDialog disabled={!generated || isLoading} onExport={handleExport} />
    </section>
  );
}
