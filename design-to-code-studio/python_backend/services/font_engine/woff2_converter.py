"""Convert font files to woff2 with Brotli compression (Phase 2)."""
from pathlib import Path


def convert_to_woff2(font_path: str, output_path: str | None = None) -> str:
    """
    Convert a TTF/OTF font to woff2 using fonttools.

    Args:
        font_path: Source font file path.
        output_path: Optional destination path. Defaults to same dir with .woff2 extension.

    Returns:
        Path of the generated woff2 file.
    """
    source = Path(font_path)
    dest = Path(output_path) if output_path else source.with_suffix(".woff2")

    from fontTools.ttLib import TTFont  # type: ignore

    font = TTFont(str(source))
    font.flavor = "woff2"
    font.save(str(dest))
    return str(dest)
