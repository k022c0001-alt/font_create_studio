"""Embed assets into HTML and resolve paths for self-contained export."""
import re
from pathlib import Path


def package_html(html: str, base_dir: str) -> str:
    """
    Inline referenced assets (CSS, JS) into an HTML string.

    Args:
        html: Source HTML content.
        base_dir: Directory that relative asset paths resolve against.

    Returns:
        HTML with assets inlined where possible.
    """
    # TODO: implement asset inlining
    return html
