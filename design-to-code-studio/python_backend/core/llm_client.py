"""Initialise the LLM client from environment configuration."""
from .config import get_settings


def get_llm_provider():
    """Return the configured LLM provider instance."""
    settings = get_settings()

    provider_name = settings.llm_provider.lower()

    if provider_name == "openai":
        from ..services.llm_engine.providers.openai import OpenAIProvider
        return OpenAIProvider(api_key=settings.openai_api_key, model=settings.openai_model)

    if provider_name == "anthropic":
        from ..services.llm_engine.providers.anthropic import AnthropicProvider
        return AnthropicProvider(api_key=settings.anthropic_api_key, model=settings.anthropic_model)

    raise ValueError(f"Unknown LLM provider: {provider_name}")
