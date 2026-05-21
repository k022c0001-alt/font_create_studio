"""Convert design tokens to CSS."""


def generate_css(tokens: dict) -> str:
    """Produce a CSS string from a design-token dict."""
    # TODO: implement token → CSS conversion
    lines = [":root {"]
    for key, value in tokens.items():
        lines.append(f"  --{key}: {value};")
    lines.append("}")
    return "\n".join(lines)
