from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import json
from dotenv import load_dotenv

load_dotenv()

from board import ensure_seed_board, get_board, save_board
from db import initialize_database
from ai import call_openrouter

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_BUILD_DIR = BASE_DIR / "frontend_build"
STATIC_TEST_DIR = BASE_DIR / "static"

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
    return get_board()

@app.put("/api/board")
async def update_board(board: dict):
    return save_board(None, board)

@app.post("/api/chat")
async def chat_endpoint(request: dict):
    message = request.get("message", "")
    if not message:
        return {"response": "Please provide a message.", "board_updated": False}
    
    board = get_board()
    ai_response = await call_openrouter(message, board)
    
    try:
        updated_board = json.loads(ai_response)
        if isinstance(updated_board, dict) and "columns" in updated_board:
            save_board(None, updated_board)
            return {"response": "Board updated successfully.", "board_updated": True}
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
