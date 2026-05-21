"""Inline woff2 fonts as base64 data URIs inside HTML."""
import base64
from pathlib import Path


def embed_font(html: str, font_path: str, font_family: str) -> str:
    """
    Replace @font-face src references with an inline base64 data URI.

    Args:
        html: Source HTML containing a @font-face declaration.
        font_path: Path to the woff2 file on disk.
        font_family: The font-family name used in the @font-face rule.

    Returns:
        HTML with the font embedded as a data URI.
    """
    font_bytes = Path(font_path).read_bytes()
    b64 = base64.b64encode(font_bytes).decode("ascii")
    data_uri = f"data:font/woff2;base64,{b64}"

    # Replace the first matching src url(...) for the given family
    html = html.replace(f"url('{font_path}')", f"url('{data_uri}')", 1)
    html = html.replace(f'url("{font_path}")', f'url("{data_uri}")', 1)
    return html
