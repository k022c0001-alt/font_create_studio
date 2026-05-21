"""Render a font preview image."""
from pathlib import Path


def render_preview(font_path: str, text: str, output_path: str, size: int = 48) -> str:
    """
    Render sample text using the given font and save as a PNG.

    Args:
        font_path: Path to the font file.
        text: Sample text to render.
        output_path: Destination PNG path.
        size: Font size in pixels.

    Returns:
        The output_path string.
    """
    # TODO: implement using Pillow (PIL) ImageFont / ImageDraw
    raise NotImplementedError("Font preview rendering not yet implemented")
