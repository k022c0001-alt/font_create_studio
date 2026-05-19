import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { electronAPI } from '../api/electronAPI';
import { useDesignStore } from '../store/designStore';
export function Dashboard() {
    const navigate = useNavigate();
    const { projects, setProjects, setCurrentProject, setError, error } = useDesignStore();
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState('');
    const loadProjects = async () => {
        try {
            setIsLoading(true);
            const records = await electronAPI.projects.list();
            setProjects(records);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        void loadProjects();
    }, []);
    const handleCreate = async () => {
        if (!name.trim()) {
            return;
        }
        const project = await electronAPI.projects.create({ name: name.trim() });
        setCurrentProject(project);
        setShowCreate(false);
        setName('');
        await loadProjects();
        navigate(`/projects/${project.id}`);
    };
    const handleDelete = async (projectId) => {
        await electronAPI.projects.delete(projectId);
        if (projects.find((project) => project.id === projectId)) {
            await loadProjects();
        }
    };
    return (_jsxs("section", { className: "dashboard-page", children: [_jsxs("div", { className: "dashboard-page__header", children: [_jsxs("div", { children: [_jsx("p", { className: "section-label", children: "Projects" }), _jsx("h1", { children: "Dashboard" }), _jsx("p", { children: "SQLite \u306B\u4FDD\u5B58\u3055\u308C\u305F\u30C7\u30B6\u30A4\u30F3\u5909\u63DB\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u7BA1\u7406\u3057\u307E\u3059\u3002" })] }), _jsxs("div", { className: "dashboard-page__actions", children: [_jsx("button", { type: "button", onClick: () => navigate('/converter'), children: "\u30AF\u30A4\u30C3\u30AF\u5909\u63DB" }), _jsx("button", { type: "button", onClick: () => setShowCreate(true), children: "\u65B0\u898F\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8" })] })] }), error ? _jsx("p", { className: "page-error", children: error }) : null, isLoading ? (_jsx("div", { className: "dashboard-empty", children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." })) : projects.length ? (_jsx("div", { className: "dashboard-grid", children: projects.map((project) => (_jsxs("article", { className: "dashboard-card", children: [_jsxs("div", { children: [_jsx("h3", { children: project.name }), _jsx("p", { children: project.image_path ? '画像あり' : '画像未登録' }), _jsx("p", { className: "dashboard-card__meta", children: new Date(project.created_at).toLocaleString('ja-JP') })] }), _jsxs("div", { className: "dashboard-card__actions", children: [_jsx("button", { type: "button", onClick: () => navigate(`/projects/${project.id}`), children: "\u958B\u304F" }), _jsx("button", { type: "button", className: "button--ghost", onClick: () => void handleDelete(project.id), children: "\u524A\u9664" })] })] }, project.id))) })) : (_jsx("div", { className: "dashboard-empty", children: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u65B0\u898F\u4F5C\u6210\u307E\u305F\u306F\u30AF\u30A4\u30C3\u30AF\u5909\u63DB\u3092\u958B\u59CB\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })), showCreate ? (_jsx("div", { className: "modal-overlay", onClick: () => setShowCreate(false), children: _jsxs("div", { className: "modal-card", onClick: (event) => event.stopPropagation(), children: [_jsx("h2", { children: "\u65B0\u898F\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8" }), _jsx("input", { value: name, onChange: (event) => setName(event.target.value), placeholder: "Project name", autoFocus: true }), _jsxs("div", { className: "modal-card__actions", children: [_jsx("button", { type: "button", className: "button--ghost", onClick: () => setShowCreate(false), children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { type: "button", onClick: () => void handleCreate(), children: "\u4F5C\u6210" })] })] }) })) : null] }));
}
