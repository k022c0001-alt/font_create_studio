"""Abstract base class for LLM providers."""
from abc import ABC, abstractmethod


class BaseLLMProvider(ABC):
    """Common interface for all LLM provider implementations."""

    @abstractmethod
    async def chat(self, messages: list[dict], **kwargs) -> str:
        """Send messages to the LLM and return the assistant response text."""
        ...

    @abstractmethod
    async def stream(self, messages: list[dict], **kwargs):
        """Yield assistant response chunks as an async generator."""
        ...
