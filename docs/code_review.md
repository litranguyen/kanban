# Comprehensive Code Review — Private Project (Kanban MVP)

**Date:** 2026-05-07  
**Reviewer:** Claude (automated)  
**Branch:** main  
**Scope:** Full repository

---

## 1. Project Overview

A single-user, local-first Kanban board MVP with:

- **Frontend:** Next.js 16 + React 19 + TypeScript, static export served by the backend
- **Backend:** FastAPI + SQLite, Python 3.12
- **AI:** Optional OpenRouter integration for AI-assisted board updates
- **Deployment:** Docker multi-stage build + Docker Compose

---

## 2. Architecture Assessment

### Strengths
- Clean separation of concerns: static frontend served by backend avoids CORS complexity
- SQLite is appropriate for a local-only, single-user tool
- Pure functions for board state mutations are testable and predictable
- Centralised type definitions in `@/types/kanban.ts` maintain a single source of truth
- Docker multi-stage build keeps the image lean

### Weaknesses
- No API contract (no OpenAPI schema enforced at the boundary)
- Board persistence uses delete-all-then-reinsert, not upsert
- No authentication on API endpoints — all routes are open (acceptable for local-only, but undocumented)
- AI chat endpoint can overwrite board state without validation of the AI response

---

## 3. Critical Issues (P0 — Fix Before Merging)

### 3.1 Broken Playwright test assertion

**File:** [frontend/tests/e2e/kanban.spec.ts](../frontend/tests/e2e/kanban.spec.ts) — line 6

The test expects `"Product Roadmap Board"` but the seed data title is `"Kanban Board"`. This test will fail on every run.

**Action:** Update the assertion to match the actual seed board title.

```typescript
// Current (broken):
await expect(page.getByRole("heading", { name: "Product Roadmap Board" })).toBeVisible();

// Fix:
await expect(page.getByRole("heading", { name: "Kanban Board" })).toBeVisible();
```

---

### 3.2 No request validation on `PUT /api/board`

**File:** [backend/app.py](../backend/app.py) — line 35

The endpoint accepts any `dict`. A malformed request body will propagate a `KeyError` from `save_board`, returning an unformatted 500 with a stack trace.

**Action:** Add a Pydantic model or at minimum a guard clause.

```python
# Fix (minimal guard):
@app.put("/api/board")
async def update_board(board: dict):
    if not isinstance(board, dict) or "id" not in board or "columns" not in board:
        raise HTTPException(status_code=400, detail="Invalid board structure")
    return save_board(None, board)
```

---

### 3.3 AI endpoint applies board updates without validation

**File:** [backend/app.py](../backend/app.py) — lines 38–55

The chat endpoint attempts to parse the AI response as JSON and writes it directly to the database. If the AI returns a plausible-looking but malformed board, it will corrupt the stored state.

**Action:** Validate the AI-returned board structure with the same guard as `PUT /api/board` before calling `save_board`. Add a backup/rollback strategy (read current board, restore on failure).

---

## 4. High-Priority Issues (P1 — Fix Soon)

### 4.1 Excessive persistence calls during drag

**File:** [frontend/src/components/KanbanBoard.tsx](../frontend/src/components/KanbanBoard.tsx) — `handleDragOver`

`persistBoard` is called on every drag-over event (every pointer movement). On a slow connection or with a large board this causes network congestion and redundant writes.

**Action:** Move persistence exclusively to `handleDragEnd`. The board state in memory updates optimistically; the server write happens only once per drop.

---

### 4.2 No React error boundary

**File:** [frontend/src/app/layout.tsx](../frontend/src/app/layout.tsx)

An unhandled render error in any child component will blank the entire page with no user-facing feedback.

**Action:** Wrap children with an error boundary in `layout.tsx`.

```tsx
// frontend/src/components/ErrorBoundary.tsx (new file)
"use client";
import { Component, ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return <p role="alert">Something went wrong. Please reload.</p>;
    return this.props.children;
  }
}
```

Then in `layout.tsx`:
```tsx
<ErrorBoundary>{children}</ErrorBoundary>
```

---

### 4.3 Missing test coverage for `ChatWidget`

There are no unit or e2e tests for the `ChatWidget` component. The AI integration path is untested.

**Action:** Add at minimum:
- A unit test that mocks `POST /api/chat` and verifies the widget displays the AI response
- An e2e test that opens the widget, sends a message, and checks the board updates

---

### 4.4 Backend routes return no HTTP error codes

Every FastAPI route currently returns 200 or lets exceptions bubble as 500. There are no explicit 400 or 404 responses.

**Action:** Add `HTTPException` raises with appropriate status codes at the boundary of each route, and wrap database calls in try/except.

---

### 4.5 Missing database indexes

**File:** [backend/db.py](../backend/db.py)

The `columns` and `cards` tables have foreign keys (`board_id`, `column_id`) but no indexes. For a board with many columns/cards, every fetch does a full-table scan.

**Action:**

```sql
CREATE INDEX IF NOT EXISTS idx_columns_board ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_column ON cards(column_id);
```

---

## 5. Medium-Priority Issues (P2 — Next Iteration)

### 5.1 `save_board` uses delete-then-reinsert

**File:** [backend/board.py](../backend/board.py)

All columns and cards are deleted and reinserted on every save. This is safe but slow for large boards and destroys any audit trail.

**Action:** Switch to `INSERT OR REPLACE` (upsert) keyed on `id`, then delete rows whose IDs are absent from the new payload.

---

### 5.2 No logging or error tracing in backend

Errors are silently lost or exposed as raw stack traces in 500 responses.

**Action:** Add `logging` to `app.py` and log exceptions before re-raising or returning error responses.

---

### 5.3 No CI pipeline

There is no `.github/workflows/` or equivalent. Tests are not run automatically on push.

**Action:** Add a GitHub Actions workflow that:
1. Runs `npm test -- --run` for the frontend
2. Runs `pytest` for the backend
3. Builds the Docker image

---

### 5.4 Hardcoded credentials visible in client bundle

**File:** [frontend/src/lib/auth.ts](../frontend/src/lib/auth.ts)

Username and password are validated entirely client-side. Any user who inspects the bundle can extract the credentials. Acceptable for a fully local-only tool, but worth documenting.

**Action:** Add a comment or README note stating this is intentional and local-only. Do not change for MVP; revisit if network deployment is considered.

---

### 5.5 No API documentation

There is no OpenAPI spec enforced or rendered (FastAPI generates one at `/docs` by default, which is helpful, but it is not referenced anywhere in the project docs).

**Action:** Link to `http://localhost:8000/docs` in `README.md` and `AGENTS.md`. Consider adding a brief API reference in `docs/`.

---

## 6. Minor Issues (P3 — Nice to Have)

| # | File | Issue | Action |
|---|------|-------|--------|
| 1 | All frontend | No Prettier config — formatting is ESLint-only | Add `.prettierrc` |
| 2 | `backend/db.py` | `check_same_thread=False` on SQLite — safe here, but worth a comment | Add inline comment explaining it is intentional |
| 3 | `frontend/src/components/KanbanBoard.tsx` | No optimistic updates — UI blocks on every API call | Consider optimistic state with rollback on error |
| 4 | `docs/` | No architecture diagram | Add a simple diagram showing frontend ↔ backend ↔ SQLite flow |
| 5 | `backend/app.py` | `DEFAULT_BOARD_ID = "board-main"` is a magic string | Move to a config constant or env var |
| 6 | `frontend` | No dark mode toggle (CSS variables exist) | Wire up a toggle using existing variables |

---

## 7. Security Summary

| Risk | Severity | Status |
|------|----------|--------|
| Parameterised SQL queries (no injection risk) | — | **PASS** |
| `.env` excluded from git (OPENROUTER_API_KEY not committed) | — | **PASS** |
| Plaintext credentials in client bundle | Low | Acceptable for local-only; document intent |
| API endpoints unauthenticated | Low | Acceptable for local-only; document intent |
| AI response written to DB without validation | Medium | **Needs fix (see 3.3)** |
| No rate limiting on chat endpoint | Low | Low risk local-only |

---

## 8. Testing Coverage Summary

| Area | Status | Gap |
|------|--------|-----|
| Auth validation (unit) | PASS | — |
| Board state helpers (unit) | PASS | — |
| `AuthGate` component | PASS | — |
| `KanbanBoard` component | PASS | — |
| `ChatWidget` component | **MISSING** | No tests at all |
| Backend board API | PASS | Chat endpoint untested |
| Playwright e2e — login | PASS | — |
| Playwright e2e — board title assertion | **BROKEN** | Expects wrong title (see 3.1) |
| Playwright e2e — drag and drop | PASS | — |

---

## 9. Phase Completion vs PLAN.md

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project setup | Complete |
| 2 | Backend scaffolding | Complete |
| 3 | Frontend static serving | Complete |
| 4 | Auth flow | Complete |
| 5 | Database modelling | Complete |
| 6 | Backend API | Complete |
| 7 | Frontend/backend integration | Complete |
| 8 | Test coverage | Partial (broken e2e, missing ChatWidget tests) |
| 9 | AI connectivity | Complete |
| 10 | AI chat integration | Complete (untested) |

---

## 10. Prioritised Action List

### P0 — Fix before any release

- [ ] Fix Playwright test assertion in [kanban.spec.ts](../frontend/tests/e2e/kanban.spec.ts) (line 6): change `"Product Roadmap Board"` → `"Kanban Board"`
- [ ] Add request validation (guard clause or Pydantic model) on `PUT /api/board` in [backend/app.py](../backend/app.py)
- [ ] Validate AI-returned board structure before writing to database in [backend/app.py](../backend/app.py) chat endpoint

### P1 — Fix in next sprint

- [ ] Move `persistBoard` call from `handleDragOver` to `handleDragEnd` in [KanbanBoard.tsx](../frontend/src/components/KanbanBoard.tsx)
- [ ] Add `ErrorBoundary` wrapper in [frontend/src/app/layout.tsx](../frontend/src/app/layout.tsx)
- [ ] Write unit and e2e tests for `ChatWidget`
- [ ] Add HTTP status codes (400, 404, 500) to all backend routes in [backend/app.py](../backend/app.py)
- [ ] Add database indexes on `board_id` (columns table) and `column_id` (cards table) in [backend/db.py](../backend/db.py)

### P2 — Next iteration

- [ ] Replace delete-then-reinsert in [backend/board.py](../backend/board.py) with upsert logic
- [ ] Add `logging` to backend and log errors before responses
- [ ] Add GitHub Actions CI workflow (frontend tests + backend tests + Docker build)
- [ ] Document that credentials/API are local-only in README
- [ ] Link to FastAPI `/docs` from README

### P3 — Nice to have

- [ ] Add `.prettierrc`
- [ ] Add optimistic updates with rollback to board mutations
- [ ] Add architecture diagram to docs
- [ ] Wire up dark mode toggle

---

## 11. Overall Assessment

**MVP Readiness:** The core Kanban board, persistence, authentication, and AI integration are all functional. The project is well-structured with good type safety and a reasonable test suite.

**Production Readiness: 6.5 / 10**

The three P0 items (broken test, missing request validation, unvalidated AI writes) should be resolved before the project is considered stable. P1 items (excessive persistence calls, missing error boundary, missing ChatWidget tests, missing HTTP status codes, missing DB indexes) represent real risks to reliability. Once P0 and P1 are addressed, this is a solid local-first MVP.
