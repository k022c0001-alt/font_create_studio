from __future__ import annotations

import base64
import json
from pathlib import Path

import httpx

from python_backend.core.config import CLAUDE_API_KEY, CLAUDE_MODEL


class ClaudeVisionError(Exception):
    pass


def analyze_image_with_claude(image_path: Path, prompt: str | None = None) -> dict:
    if not CLAUDE_API_KEY:
        raise ClaudeVisionError('CLAUDE_API_KEY is not configured')

    image_bytes = image_path.read_bytes()
    media_type = 'image/png' if image_path.suffix.lower() == '.png' else 'image/jpeg'
    encoded = base64.b64encode(image_bytes).decode('utf-8')
    instructions = prompt or (
        'Extract UI components from this screen and return strict JSON with keys: '
        'layout_summary and elements. Each element must include id,type,x,y,width,height,text.'
    )

    payload = {
        'model': CLAUDE_MODEL,
        'max_tokens': 1024,
        'messages': [
            {
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': instructions},
                    {
                        'type': 'image',
                        'source': {
                            'type': 'base64',
                            'media_type': media_type,
                            'data': encoded,
                        },
                    },
                ],
            }
        ],
    }

    headers = {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
    }

    with httpx.Client(timeout=60) as client:
        response = client.post('https://api.anthropic.com/v1/messages', headers=headers, json=payload)
    if response.status_code >= 400:
        raise ClaudeVisionError(f'Claude Vision API failed: {response.status_code} {response.text}')

    data = response.json()
    text_blocks = [item.get('text', '') for item in data.get('content', []) if item.get('type') == 'text']
    raw = '\n'.join(text_blocks).strip()
    if raw.startswith('```'):
        raw = raw.strip('`')
        raw = raw.replace('json\n', '', 1)
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ClaudeVisionError(f'Failed to parse Claude Vision JSON: {raw[:300]}') from exc
