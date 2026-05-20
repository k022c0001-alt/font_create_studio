from __future__ import annotations

from pathlib import Path

from python_backend.schemas.design_schema import DetectedElement
from python_backend.services.claude_vision import ClaudeVisionError, analyze_image_with_claude
from python_backend.services.design_to_code.layout_extractor import extract_layout_from_image, normalize_element


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

    fallback_elements, layout_summary = extract_layout_from_image(image_path)
    return AnalysisResult(elements=fallback_elements, layout_summary=layout_summary, source='fallback')
