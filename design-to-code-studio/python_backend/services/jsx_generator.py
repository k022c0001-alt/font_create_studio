from __future__ import annotations

from python_backend.schemas.design_schema import DetectedElement
from python_backend.services.css_generator import generate_css


def generate_jsx_and_css(component_name: str, elements: list[DetectedElement]) -> tuple[str, str]:
    jsx_lines = [f"import './{component_name}.css';", '', f'export default function {component_name}() {{', f'  return <div className="{component_name}">']

    for element in elements:
        cls = element.class_name or f'element-{element.id}'
        text = element.text or ''
        if element.type == 'text':
            jsx_lines.append(f'    <p className="{cls}">{text}</p>')
        elif element.type == 'button':
            jsx_lines.append(f'    <button className="{cls}">{text or "Button"}</button>')
        elif element.type == 'image':
            jsx_lines.append(f'    <img className="{cls}" alt="{element.id}" />')
        elif element.type == 'input':
            jsx_lines.append(f'    <input className="{cls}" placeholder="{text or "Input"}" />')
        else:
            jsx_lines.append(f'    <div className="{cls}">{text}</div>')

    jsx_lines.extend(['  </div>;', '}'])
    css = generate_css(component_name, elements)
    return '\n'.join(jsx_lines), css
