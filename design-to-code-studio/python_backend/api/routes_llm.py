from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChatRequest(BaseModel):
    project_id: str
    message: str
    history: list[dict] = []


@router.post("/chat")
async def chat(body: ChatRequest):
    """Send a message to the LLM and receive a response."""
    # TODO: delegate to llm_engine
    return {"role": "assistant", "content": ""}


@router.post("/chat/stream")
async def chat_stream(body: ChatRequest):
    """Streaming version of the chat endpoint."""
    # TODO: implement SSE streaming via llm_engine
    return {"status": "not_implemented"}
