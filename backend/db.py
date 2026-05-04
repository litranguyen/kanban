from __future__ import annotations

from pathlib import Path
import sqlite3
from sqlite3 import Connection

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "kanban.db"

CREATE_TABLES_SQL = [
    """CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )""",
    """CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS columns (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        title TEXT NOT NULL,
        sort_index INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE
    )""",
    """CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        column_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT "",
        priority TEXT DEFAULT "medium",
        labels TEXT DEFAULT "",
        due_date TEXT,
        sort_index INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY(column_id) REFERENCES columns(id) ON DELETE CASCADE
    )""",
]


def get_db_path() -> Path:
    return DB_FILE


def create_connection() -> Connection:
    connection = sqlite3.connect(str(DB_FILE), check_same_thread=False)
    connection.row_factory = sqlite3.Row
    return connection


def create_schema(connection: Connection) -> None:
    for statement in CREATE_TABLES_SQL:
        connection.execute(statement)
    connection.commit()


def initialize_database() -> None:
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    with create_connection() as connection:
        create_schema(connection)
