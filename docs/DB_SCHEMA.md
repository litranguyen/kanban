# Kanban Storage Schema

This document describes the SQLite schema used by the backend for the single-user Kanban board.

## Database file

- `backend/kanban.db`
- Created automatically on first backend startup.
- Excluded from source control via `.gitignore`.

## Tables

### `users`

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `username` TEXT NOT NULL UNIQUE
- `password` TEXT NOT NULL
- `created_at` TEXT NOT NULL

This table stores the single user account used for app authentication.

### `boards`

- `id` TEXT PRIMARY KEY
- `title` TEXT NOT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

The app supports exactly one board per user. Board metadata is stored here.

### `columns`

- `id` TEXT PRIMARY KEY
- `board_id` TEXT NOT NULL
- `title` TEXT NOT NULL
- `sort_index` INTEGER NOT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

Columns represent the ordered sections of the board like Backlog, To Do, In Progress, Review, and Done.

### `cards`

- `id` TEXT PRIMARY KEY
- `board_id` TEXT NOT NULL
- `column_id` TEXT NOT NULL
- `title` TEXT NOT NULL
- `description` TEXT
- `priority` TEXT DEFAULT "medium"
- `labels` TEXT DEFAULT ""
- `due_date` TEXT
- `sort_index` INTEGER NOT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

Cards store task details, including label and priority metadata. Labels are stored as serialized text for flexibility.

## Notes

- The schema is intentionally minimal and local-only.
- `due_date` is optional and stored as ISO-8601 text when provided.
- Relationships use foreign keys for board/column consistency.
