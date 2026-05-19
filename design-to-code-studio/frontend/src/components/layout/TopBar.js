import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
export function TopBar() {
    const location = useLocation();
    const title = location.pathname === '/' ? 'Project Dashboard' : 'Design Converter';
    return (_jsxs("header", { className: "topbar", children: [_jsxs("div", { children: [_jsx("p", { className: "topbar__label", children: "Desktop workspace" }), _jsx("h2", { children: title })] }), _jsx("div", { className: "topbar__meta", children: "SQLite project history enabled" })] }));
}
