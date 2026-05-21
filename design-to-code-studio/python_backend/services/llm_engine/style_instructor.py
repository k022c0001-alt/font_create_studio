"""Convert natural-language design instructions to CSS."""


async def instruct_to_css(instruction: str) -> str:
    """
    Use an LLM to translate a design instruction into CSS rules.

    Args:
        instruction: Natural-language design instruction (e.g. "make the header dark blue").

    Returns:
        A CSS string representing the instruction.
    """
    # TODO: call llm_engine with a CSS-specific system prompt
    return "/* TODO: generated CSS */"
