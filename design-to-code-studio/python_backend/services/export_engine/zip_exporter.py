"""Package project output files into a ZIP archive."""
import zipfile
from pathlib import Path


def create_zip(source_dir: str, output_path: str) -> str:
    """
    Zip all files in source_dir and write to output_path.

    Returns:
        The output_path string.
    """
    source = Path(source_dir)
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for file in source.rglob("*"):
            if file.is_file():
                zf.write(file, file.relative_to(source))
    return output_path
