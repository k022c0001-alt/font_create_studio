import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CodeEditor({ jsx, css }) {
    return (_jsxs("section", { className: "panel editor", children: [_jsxs("div", { children: [_jsx("p", { className: "section-label", children: "3. Generated code" }), _jsx("h3", { children: "React JSX + CSS" })] }), _jsxs("div", { className: "editor__grid", children: [_jsxs("article", { children: [_jsx("h4", { children: "JSX" }), _jsx("pre", { children: jsx || '// JSX will appear here' })] }), _jsxs("article", { children: [_jsx("h4", { children: "CSS" }), _jsx("pre", { children: css || '/* CSS will appear here */' })] })] })] }));
}
