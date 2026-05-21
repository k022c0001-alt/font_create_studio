"""Build context-enriched prompts for LLM requests."""


def build_prompt(user_message: str, history: list[dict], system_prompt: str = "") -> list[dict]:
    """
    Construct a messages list for the LLM API.

    Args:
        user_message: The latest user message.
        history: Previous chat messages (role/content dicts).
        system_prompt: Optional system-level instruction.

    Returns:
        A list of message dicts ready for the LLM provider.
    """
    messages: list[dict] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})
    return messages
