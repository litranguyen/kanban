from __future__ import annotations

from datetime import datetime, timezone
from sqlite3 import Connection
from typing import Any

from db import create_connection

DEFAULT_BOARD_ID = "board-main"

SEED_BOARD = {
    "id": DEFAULT_BOARD_ID,
    "title": "Kanban Board",
    "columns": [
        {
            "id": "column-backlog",
            "title": "Backlog",
            "cards": [
                {
                    "id": "card-1",
                    "title": "Onboarding flow copy pass",
                    "details": "Refine tone and shorten first-run experience copy.",
                },
                {
                    "id": "card-2",
                    "title": "Mobile spacing audit",
                    "details": "Review all key screens for spacing consistency.",
                },
            ],
        },
        {
            "id": "column-ready",
            "title": "Ready",
            "cards": [
                {
                    "id": "card-3",
                    "title": "Dashboard loading state",
                    "details": "Add graceful skeleton transitions for first load.",
                },
            ],
        },
        {
            "id": "column-progress",
            "title": "In Progress",
            "cards": [
                {
                    "id": "card-4",
                    "title": "Billing screen refresh",
                    "details": "Polish hierarchy and update plan comparison section.",
                },
            ],
        },
        {
            "id": "column-review",
            "title": "Review",
            "cards": [
                {
                    "id": "card-5",
                    "title": "Accessibility keyboard pass",
                    "details": "Verify focus order and labels across core flows.",
                },
            ],
        },
        {
            "id": "column-done",
            "title": "Done",
            "cards": [
                {
                    "id": "card-6",
                    "title": "Brand color system",
                    "details": "Finalized semantic token mapping for launch theme.",
                },
            ],
        },
    ],
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_card(row: Any) -> dict[str, Any]:
    return {
        "id": row["id"],
        "title": row["title"],
        "details": row["description"],
    }


def _normalize_column(row: Any, cards: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "title": row["title"],
        "cards": cards,
    }


def ensure_seed_board(connection: Connection | None = None) -> dict[str, Any]:
    if connection is None:
        connection = create_connection()
    board = get_board(connection)
    if board is None:
        return save_board(connection, SEED_BOARD)
    return board


def get_board(connection: Connection | None = None) -> dict[str, Any] | None:
    if connection is None:
        connection = create_connection()
    board_row = connection.execute(
        "SELECT id, title FROM boards WHERE id = ?",
        (DEFAULT_BOARD_ID,),
    ).fetchone()
    if board_row is None:
        return None

    columns = []
    column_rows = connection.execute(
        "SELECT id, title FROM columns WHERE board_id = ? ORDER BY sort_index",
        (DEFAULT_BOARD_ID,),
    ).fetchall()

    for column_row in column_rows:
        card_rows = connection.execute(
            "SELECT id, title, description FROM cards WHERE board_id = ? AND column_id = ? ORDER BY sort_index",
            (DEFAULT_BOARD_ID, column_row["id"]),
        ).fetchall()
        cards = [_normalize_card(card_row) for card_row in card_rows]
        columns.append(_normalize_column(column_row, cards))

    return {
        "id": board_row["id"],
        "title": board_row["title"],
        "columns": columns,
    }


def save_board(connection: Connection | None, board: dict[str, Any]) -> dict[str, Any]:
    if connection is None:
        connection = create_connection()

    board_id = board["id"]
    title = board["title"]
    now = now_iso()

    existing = connection.execute(
        "SELECT 1 FROM boards WHERE id = ?",
        (board_id,),
    ).fetchone()

    if existing:
        connection.execute(
            "UPDATE boards SET title = ?, updated_at = ? WHERE id = ?",
            (title, now, board_id),
        )
    else:
        connection.execute(
            "INSERT INTO boards (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (board_id, title, now, now),
        )

    connection.execute("DELETE FROM cards WHERE board_id = ?", (board_id,))
    connection.execute("DELETE FROM columns WHERE board_id = ?", (board_id,))

    for column_index, column in enumerate(board["columns"]):
        connection.execute(
            "INSERT INTO columns (id, board_id, title, sort_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (
                column["id"],
                board_id,
                column["title"],
                column_index,
                now,
                now,
            ),
        )

        for card_index, card in enumerate(column.get("cards", [])):
            connection.execute(
                "INSERT INTO cards (id, board_id, column_id, title, description, priority, labels, due_date, sort_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    card["id"],
                    board_id,
                    column["id"],
                    card["title"],
                    card.get("details", ""),
                    card.get("priority", "medium"),
                    card.get("labels", ""),
                    card.get("due_date"),
                    card_index,
                    now,
                    now,
                ),
            )

    connection.commit()
    return get_board(connection)
