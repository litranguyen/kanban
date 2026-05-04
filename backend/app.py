from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_BUILD_DIR = BASE_DIR / "frontend_build"
STATIC_TEST_DIR = BASE_DIR / "static"

app = FastAPI(title="Kanban MVP Backend")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if FRONTEND_BUILD_DIR.exists():
    app.mount("/_next", StaticFiles(directory=FRONTEND_BUILD_DIR / "_next"), name="_next")
    if (FRONTEND_BUILD_DIR / "static").exists():
        app.mount("/static", StaticFiles(directory=FRONTEND_BUILD_DIR / "static"), name="frontend_static")
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend")
else:
    app.mount("/", StaticFiles(directory=STATIC_TEST_DIR, html=True), name="static")
