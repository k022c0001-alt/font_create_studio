import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function ExportDialog({ disabled, onExport }) {
    const [name, setName] = useState('GeneratedScreen');
    return (_jsxs("section", { className: "panel modal-panel", children: [_jsxs("div", { children: [_jsx("p", { className: "section-label", children: "4. Export" }), _jsx("h3", { children: "Save component files" })] }), _jsxs("div", { className: "modal-panel__row", children: [_jsx("input", { value: name, onChange: (event) => setName(event.target.value), placeholder: "Component name" }), _jsx("button", { type: "button", disabled: disabled, onClick: () => void onExport(name.trim() || 'GeneratedScreen'), children: "Export JSX/CSS" })] })] }));
}
