from pathlib import Path

from fastapi.testclient import TestClient

from backend.app import app
from backend import db
from backend.board import SEED_BOARD


def test_get_board_returns_seed_board(tmp_path: Path) -> None:
    db.DB_FILE = tmp_path / "test-kanban.db"
    with TestClient(app) as client:
        response = client.get("/api/board")

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == SEED_BOARD["id"]
    assert payload["title"] == SEED_BOARD["title"]
    assert len(payload["columns"]) == len(SEED_BOARD["columns"])
    assert payload["columns"][0]["id"] == SEED_BOARD["columns"][0]["id"]


def test_put_board_updates_and_persists(tmp_path: Path) -> None:
    db.DB_FILE = tmp_path / "test-kanban.db"
    with TestClient(app) as client:
        response = client.get("/api/board")
        assert response.status_code == 200
        board = response.json()

        board["title"] = "Updated Product Roadmap"
        board["columns"][0]["title"] = "Backlog Revised"
        board["columns"][0]["cards"][0]["title"] = "Updated onboarding copy"

        update_response = client.put("/api/board", json=board)
        assert update_response.status_code == 200
        updated_board = update_response.json()

        assert updated_board["title"] == "Updated Product Roadmap"
        assert updated_board["columns"][0]["title"] == "Backlog Revised"
        assert updated_board["columns"][0]["cards"][0]["title"] == "Updated onboarding copy"

        reload_response = client.get("/api/board")
        assert reload_response.status_code == 200
        reloaded_board = reload_response.json()
        assert reloaded_board["title"] == "Updated Product Roadmap"
        assert reloaded_board["columns"][0]["title"] == "Backlog Revised"
        assert reloaded_board["columns"][0]["cards"][0]["title"] == "Updated onboarding copy"
