"""Subset a font to the requested Unicode ranges (Phase 2)."""
import subprocess
from pathlib import Path


def subset_font(font_path: str, unicode_ranges: list[str], output_path: str) -> str:
    """
    Run pyftsubset to produce a subset font at output_path.

    Args:
        font_path: Source font file.
        unicode_ranges: List of Unicode range strings, e.g. ["U+0020-007E"].
        output_path: Destination path for the subset font.

    Returns:
        The output_path string.
    """
    unicodes_arg = ",".join(unicode_ranges)
    subprocess.run(
        [
            "pyftsubset",
            font_path,
            f"--unicodes={unicodes_arg}",
            f"--output-file={output_path}",
        ],
        check=True,
    )
    return output_path
