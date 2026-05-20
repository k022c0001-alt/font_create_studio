import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const { currentProject, analysis, generated, isLoading, error, setCurrentProject, setUpload, setAnalysis, setGenerated, setLoading, setError, setExportPath, resetWorkspace, } = useDesignStore();
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
            }
            catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            }
        })();
    }, [projectId, resetWorkspace, setCurrentProject, setError]);
    const handleUpload = async (file) => {
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setLoading(false);
        }
    };
    const handleExport = async (name) => {
        if (!generated) {
            return;
        }
        const result = await electronAPI.exportCode(name, generated.jsx, generated.css);
        setExportPath(result.path);
    };
    return (_jsxs("section", { className: "converter-page", children: [_jsxs("div", { className: "converter-page__intro panel", children: [_jsxs("div", { children: [_jsx("p", { className: "section-label", children: "Workspace" }), _jsx("h1", { children: currentProject?.name || 'Design Converter' }), _jsx("p", { children: currentProject?.image_path ? '既存プロジェクトを再解析できます。' : '画像をアップロードして新しい React コンポーネントを生成してください。' })] }), projectId ? _jsx("button", { type: "button", className: "button--ghost", onClick: () => navigate('/'), children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3078\u623B\u308B" }) : null] }), error ? _jsx("p", { className: "page-error", children: error }) : null, isLoading ? _jsx("p", { className: "page-message", children: "Processing design image\u2026" }) : null, _jsx(ImageUploader, { onFile: (file) => void handleUpload(file), projectName: currentProject?.name, disabled: isLoading }), _jsx(AnalysisPreview, { analysis: analysis }), _jsx(CodeEditor, { jsx: generated?.jsx, css: generated?.css }), _jsx(ExportDialog, { disabled: !generated || isLoading, onExport: handleExport })] }));
}
