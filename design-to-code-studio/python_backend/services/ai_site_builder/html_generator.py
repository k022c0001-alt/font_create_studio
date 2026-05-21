"""Assemble section-level HTML for a generated site."""


def generate_html(sections: list[dict]) -> str:
    """Build full HTML from a list of section dicts."""
    # TODO: implement HTML assembly
    parts = ["<!doctype html>", "<html lang='ja'>", "<body>"]
    for section in sections:
        parts.append(f"<section id='{section.get('id', '')}'></section>")
    parts.append("</body>")
    parts.append("</html>")
    return "\n".join(parts)
