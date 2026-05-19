import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDesignStore } from '../../store/designStore';
export function StatusBar() {
    const { isLoading, error, currentProject, exportPath } = useDesignStore();
    const status = error ? `Error: ${error}` : isLoading ? 'Processing design…' : 'Ready';
    return (_jsxs("footer", { className: "statusbar", children: [_jsx("span", { children: status }), _jsx("span", { children: currentProject ? `Project: ${currentProject.name}` : 'No project selected' }), _jsx("span", { children: exportPath ? `Exported to ${exportPath}` : 'No export yet' })] }));
}
