import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { DesignConverter } from './pages/DesignConverter';
export default function App() {
    return (_jsx(AppShell, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/converter", element: _jsx(DesignConverter, {}) }), _jsx(Route, { path: "/projects/:projectId", element: _jsx(DesignConverter, {}) })] }) }));
}
