from __future__ import annotations

from pathlib import Path

from PIL import Image

from python_backend.schemas.design_schema import DetectedElement
from python_backend.services.claude_vision import ClaudeVisionError, analyze_image_with_claude


class AnalysisResult:
    def __init__(self, elements: list[DetectedElement], layout_summary: str, source: str) -> None:
        self.elements = elements
        self.layout_summary = layout_summary
        self.source = source


def analyze_ui_image(image_path: Path, prompt: str | None = None) -> AnalysisResult:
    try:
        payload = analyze_image_with_claude(image_path, prompt)
        elements = [DetectedElement(**normalize_element(item, idx)) for idx, item in enumerate(payload.get('elements', []), 1)]
        if elements:
            return AnalysisResult(
                elements=elements,
                layout_summary=payload.get('layout_summary', 'Analyzed by Claude Vision'),
                source='claude_vision',
            )
    except ClaudeVisionError:
        pass

    return fallback_analyze(image_path)


def fallback_analyze(image_path: Path) -> AnalysisResult:
    with Image.open(image_path) as img:
        width, height = img.size

    elements = [
        DetectedElement(id='header', type='container', x=0, y=0, width=width, height=max(64, height // 10), class_name='header'),
        DetectedElement(
            id='hero-title',
            type='text',
            x=width // 12,
            y=height // 5,
            width=max(120, width * 2 // 3),
            height=max(40, height // 12),
            text='Generated Title',
            class_name='heroTitle',
        ),
        DetectedElement(
            id='cta',
            type='button',
            x=width // 12,
            y=height // 2,
            width=max(120, width // 4),
            height=max(44, height // 14),
            text='Call To Action',
            class_name='ctaButton',
        ),
    ]
    return AnalysisResult(elements=elements, layout_summary='Fallback heuristic layout extraction', source='fallback')


def normalize_element(item: dict, idx: int) -> dict:
    return {
        'id': str(item.get('id') or f'el-{idx}'),
        'type': item.get('type', 'unknown'),
        'x': int(item.get('x', 0)),
        'y': int(item.get('y', 0)),
        'width': max(1, int(item.get('width', 1))),
        'height': max(1, int(item.get('height', 1))),
        'text': item.get('text'),
        'class_name': item.get('class_name') or f'el{idx}',
    }
