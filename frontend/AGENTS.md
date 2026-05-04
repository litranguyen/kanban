# Frontend AGENTS

## Purpose
Document the current Next.js frontend architecture, component responsibilities, and test coverage for the existing Kanban demo.

## Structure
- `frontend/src/app/page.tsx`
  - Renders the client-side entrypoint `KanbanBoardClient`.
- `frontend/src/components/KanbanBoardClient.tsx`
  - Client component wrapper that loads `KanbanBoard`.
- `frontend/src/components/KanbanBoard.tsx`
  - Main Kanban board UI and interaction logic.
  - Handles drag-and-drop, card creation/deletion, and column renaming.
  - Uses `@dnd-kit/core` and `@dnd-kit/sortable`.
- `frontend/src/lib/boardState.ts`
  - Pure board helper functions for board updates.
- `frontend/src/data/seedBoard.ts`
  - Provides the initial demo board data.
- `frontend/src/types/kanban.ts`
  - Defines `Board`, `Column`, and `Card` types.

## Key Components

### `KanbanBoard`
- Client state initialized from `seedBoard`.
- Local `useState<Board>` board state.
- Drag-and-drop logic:
  - `handleDragStart`
  - `handleDragOver`
  - `handleDragEnd`
- Column title editing.
- Card creation via `CardForm`.
- Card deletion via `deleteCard`.

### `CardForm`
- Adds a new card with title and details.
- Prevents submit when fields are empty.

### `SortableCard`
- Draggable card item.
- Displays title, details, and delete button.

### `KanbanColumn`
- Droppable column wrapper.
- Contains sortable cards and add-card form.

## Board helper functions
- `renameColumn(board, columnId, title)`
- `addCard(board, columnId, payload)`
- `deleteCard(board, cardId)`
- `moveCard(board, cardId, toColumnId, toIndex)`

## Tests
- `frontend/src/components/KanbanBoard.test.tsx`
  - Verifies seeded columns render.
  - Verifies column rename.
  - Verifies add/delete card flows.
- `frontend/src/lib/boardState.test.ts`
  - Verifies pure helper functions.

## Notes
- Current frontend is client-only with local demo state.
- No auth flow yet.
- No backend persistence yet.
- Next step: preserve current behavior while migrating board state to backend-driven data and auth gating.
