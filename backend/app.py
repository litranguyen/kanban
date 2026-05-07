import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

load_dotenv()

from board import ensure_seed_board, get_board, save_board
from db import initialize_database
from ai import call_openrouter

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_BUILD_DIR = BASE_DIR / "frontend_build"
STATIC_TEST_DIR = BASE_DIR / "static"


def _validate_board(board: dict) -> None:
    if not isinstance(board, dict) or "id" not in board or "title" not in board or "columns" not in board:
        raise HTTPException(status_code=400, detail="Invalid board structure: must include id, title, and columns")


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    ensure_seed_board()
    yield

app = FastAPI(title="Kanban MVP Backend", lifespan=lifespan)

@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/api/board")
async def read_board():
    try:
        board = get_board()
    except Exception as exc:
        logger.error("Failed to read board: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to read board")
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")
    return board

@app.put("/api/board")
async def update_board(board: dict):
    _validate_board(board)
    try:
        return save_board(None, board)
    except Exception as exc:
        logger.error("Failed to save board: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save board")

@app.post("/api/chat")
async def chat_endpoint(request: dict):
    message = request.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="message is required")

    try:
        board = get_board()
    except Exception as exc:
        logger.error("Failed to read board for chat: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to read board")
    if board is None:
        raise HTTPException(status_code=404, detail="Board not found")

    ai_response = await call_openrouter(message, board)

    try:
        updated_board = json.loads(ai_response)
        if (
            isinstance(updated_board, dict)
            and "id" in updated_board
            and "title" in updated_board
            and "columns" in updated_board
        ):
            try:
                save_board(None, updated_board)
                return {"response": "Board updated successfully.", "board_updated": True}
            except Exception as exc:
                logger.error("Failed to apply AI board update: %s", exc)
                return {"response": "AI suggested a change but it could not be applied.", "board_updated": False}
        else:
            return {"response": ai_response, "board_updated": False}
    except json.JSONDecodeError:
        return {"response": ai_response, "board_updated": False}

if FRONTEND_BUILD_DIR.exists():
    app.mount("/_next", StaticFiles(directory=FRONTEND_BUILD_DIR / "_next"), name="_next")
    if (FRONTEND_BUILD_DIR / "static").exists():
        app.mount("/static", StaticFiles(directory=FRONTEND_BUILD_DIR / "static"), name="frontend_static")
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend")
else:
    app.mount("/", StaticFiles(directory=STATIC_TEST_DIR, html=True), name="static")
