"""Anthropic Claude provider implementation (future addition)."""
from . import BaseLLMProvider


class AnthropicProvider(BaseLLMProvider):
    """LLM provider backed by the Anthropic Claude API."""

    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key
        self.model = model

    async def chat(self, messages: list[dict], **kwargs) -> str:
        """Call the Anthropic messages endpoint."""
        # TODO: implement using anthropic SDK
        raise NotImplementedError

    async def stream(self, messages: list[dict], **kwargs):
        """Stream tokens from the Anthropic messages endpoint."""
        # TODO: implement using anthropic SDK with stream=True
        raise NotImplementedError
        yield  # make this an async generator
