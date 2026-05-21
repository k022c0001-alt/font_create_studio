"""OpenAI GPT-4o provider implementation."""
from . import BaseLLMProvider


class OpenAIProvider(BaseLLMProvider):
    """LLM provider backed by the OpenAI API."""

    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model

    async def chat(self, messages: list[dict], **kwargs) -> str:
        """Call the OpenAI chat completions endpoint."""
        # TODO: implement using openai SDK
        raise NotImplementedError

    async def stream(self, messages: list[dict], **kwargs):
        """Stream tokens from the OpenAI chat completions endpoint."""
        # TODO: implement using openai SDK with stream=True
        raise NotImplementedError
        yield  # make this an async generator
