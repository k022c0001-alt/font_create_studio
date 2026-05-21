"""Parse and structure LLM responses."""
import json


def parse_response(raw: str) -> dict:
    """
    Attempt to extract structured data from an LLM text response.

    Falls back to returning the raw text under the 'content' key.
    """
    try:
        start = raw.index("{")
        end = raw.rindex("}") + 1
        return json.loads(raw[start:end])
    except (ValueError, json.JSONDecodeError):
        return {"content": raw}
