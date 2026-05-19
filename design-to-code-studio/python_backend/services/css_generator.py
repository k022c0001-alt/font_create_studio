from __future__ import annotations

from python_backend.schemas.design_schema import DetectedElement


def generate_css(component_name: str, elements: list[DetectedElement]) -> str:
    lines = [
        f'.{component_name} {{',
        '  position: relative;',
        '  width: 100%;',
        '  max-width: 1200px;',
        '  margin: 0 auto;',
        '  min-height: 720px;',
        '  background: #ffffff;',
        '}',
    ]
    for element in elements:
        cls = element.class_name or f'element-{element.id}'
        lines.extend(
            [
                f'.{component_name} .{cls} {{',
                '  position: absolute;',
                f'  left: {element.x}px;',
                f'  top: {element.y}px;',
                f'  width: {element.width}px;',
                f'  height: {element.height}px;',
                '}',
            ]
        )
    return '\n'.join(lines)
