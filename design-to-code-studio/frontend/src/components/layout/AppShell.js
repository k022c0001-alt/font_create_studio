import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { StatusBar } from './StatusBar';
export function AppShell({ children }) {
    return (_jsxs("div", { className: "app-shell", children: [_jsx(TopBar, {}), _jsxs("div", { className: "app-shell__body", children: [_jsx(Sidebar, {}), _jsx("main", { className: "app-shell__content", children: children })] }), _jsx(StatusBar, {})] }));
}
