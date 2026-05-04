from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

try:
    from .board import ensure_seed_board, get_board, save_board
    from .db import initialize_database
except ImportError:
    from board import ensure_seed_board, get_board, save_board
    from db import initialize_database

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

if FRONTEND_BUILD_DIR.exists():
    app.mount("/_next", StaticFiles(directory=FRONTEND_BUILD_DIR / "_next"), name="_next")
    if (FRONTEND_BUILD_DIR / "static").exists():
        app.mount("/static", StaticFiles(directory=FRONTEND_BUILD_DIR / "static"), name="frontend_static")
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend")
else:
    app.mount("/", StaticFiles(directory=STATIC_TEST_DIR, html=True), name="static")
