import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ImageUploader({ onFile, projectName, disabled }) {
    const handleFiles = (fileList) => {
        const file = fileList?.[0];
        if (file && !disabled) {
            onFile(file);
        }
    };
    return (_jsxs("section", { className: "panel uploader", children: [_jsxs("div", { children: [_jsx("p", { className: "section-label", children: "1. Upload design image" }), _jsx("h3", { children: projectName ? `${projectName} に画像を追加` : '新しいデザインを読み込む' }), _jsx("p", { children: "Figma \u306E\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8\u3084 UI \u753B\u50CF\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3059\u308B\u3068\u3001Claude Vision \u3067\u89E3\u6790\u3057\u3066 JSX/CSS \u3092\u751F\u6210\u3057\u307E\u3059\u3002" })] }), _jsxs("label", { className: `uploader__dropzone${disabled ? ' uploader__dropzone--disabled' : ''}`, onDragOver: (event) => event.preventDefault(), onDrop: (event) => {
                    event.preventDefault();
                    handleFiles(event.dataTransfer.files);
                }, children: [_jsx("input", { type: "file", accept: "image/*", disabled: disabled, onChange: (event) => handleFiles(event.target.files) }), _jsx("span", { children: "\u30C9\u30E9\u30C3\u30B0\uFF06\u30C9\u30ED\u30C3\u30D7\u3001\u307E\u305F\u306F\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u753B\u50CF\u3092\u9078\u629E" })] })] }));
}
