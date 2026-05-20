import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
export function Sidebar() {
    return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "sidebar__header", children: [_jsx("p", { className: "sidebar__eyebrow", children: "Claude Vision + Electron" }), _jsx("h1", { children: "Design-to-Code Studio" })] }), _jsxs("nav", { className: "sidebar__nav", children: [_jsx(NavLink, { className: "sidebar__link", to: "/", children: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx(NavLink, { className: "sidebar__link", to: "/converter", children: "\u5909\u63DB\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9" })] }), _jsx("div", { className: "sidebar__footer", children: _jsx("p", { children: "PNG / JPG / WEBP \u306E UI \u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8\u3092\u89E3\u6790\u3057\u3001React JSX \u3068 CSS \u3092\u751F\u6210\u3057\u307E\u3059\u3002" }) })] }));
}
