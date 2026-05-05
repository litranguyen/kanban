import os
import json
import httpx
from typing import Dict, Any

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-oss-120b:free"

async def call_openrouter(message: str, board_context: Dict[str, Any]) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set")

    system_prompt = f"""You are a helpful assistant for managing a Kanban board. The current board state is: {json.dumps(board_context)}.

When the user asks to make changes to the board (like adding, editing, or moving tasks), respond with a JSON object containing the updated board in the same format.
For other questions or general chat, respond with plain text.

If updating the board, return only the JSON object. For chat, return only the text response."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": message}
    ]

    data = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.7
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(OPENROUTER_URL, headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }, json=data, timeout=30.0)
        resp.raise_for_status()
        result = resp.json()
        return result["choices"][0]["message"]["content"].strip()