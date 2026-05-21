"""Load and validate TTF/OTF font files."""
from pathlib import Path


def load_font(path: str):
    """Load a font file and return a fonttools TTFont object."""
    from fontTools.ttLib import TTFont  # type: ignore

    font_path = Path(path)
    if not font_path.exists():
        raise FileNotFoundError(f"Font not found: {path}")
    return TTFont(str(font_path))
