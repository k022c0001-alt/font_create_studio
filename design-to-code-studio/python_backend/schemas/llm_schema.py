"""Pydantic models for LLM chat history and responses."""
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class ChatRequest(BaseModel):
    project_id: str
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    model: str = ""
