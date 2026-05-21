"""Adjust Variable Font axis parameters (Phase 1)."""


def adjust_axes(font_path: str, axes: dict[str, float], output_path: str) -> str:
    """
    Pin or adjust Variable Font axes and save to output_path.

    Args:
        font_path: Path to the source variable font.
        axes: Mapping of axis tag → value (e.g. {"wght": 700}).
        output_path: Destination path for the adjusted font.

    Returns:
        The output_path string.
    """
    from fontTools.ttLib import TTFont  # type: ignore
    from fontTools.varLib.instancer import instantiateVariableFont  # type: ignore

    font = TTFont(font_path)
    instantiateVariableFont(font, axes)
    font.save(output_path)
    return output_path
