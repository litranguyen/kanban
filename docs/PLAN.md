# Project plan for the Project Management MVP

This plan breaks the work into concrete phases, with explicit goals, success criteria, and test expectations. The application is a local-only single-user Kanban board with persistent storage and a FastAPI backend serving a production-built Next.js frontend.

## Phase 1: Project setup and verification

- Confirm the current repo state.
  - `frontend/` contains the existing demo app.
  - `backend/` is empty and needs scaffolding.
  - `scripts/` is empty and needs startup/stop helpers.
- Add `.gitignore` entries for `node_modules`, `.next`, `.env`, `__pycache__`, `*.db`, and build artifacts.
- Create `frontend/AGENTS.md` documenting the current frontend architecture and test surface.
- Success criteria:
  - Repo structure is documented.
  - `frontend/AGENTS.md` exists.
  - Initial setup tasks are complete.

## Phase 2: Backend and Docker scaffolding

- Create `backend/` with FastAPI application and dependency layout.
- Add a `Dockerfile` and local shell scripts that use `uv` as the Python package manager.
- Implement a simple route at `/api/health`.
- Configure the backend to serve static files from the built frontend at `/`.
- Success criteria:
  - Backend starts and responds to `/api/health`.
  - Backend can serve a static test page.

## Phase 3: Frontend static serving

- Confirm the frontend builds successfully.
- Configure backend static serving for the Next.js production build output.
- Verify the Kanban demo renders at `/` through the backend.
- Success criteria:
  - `frontend` builds successfully.
  - Backend serves the built frontend at root.
  - The board UI loads through the backend.

## Phase 4: Single-user auth flow

- Add a login screen before the board is accessible.
- Use fixed credentials: `user` / `password`.
- Support logout and return to the login screen.
- Do not add registration or multi-user capability.
- Add frontend tests for the auth flow:
  - login screen renders correctly
  - valid credentials unlock the board
  - invalid credentials stay on login
  - logout returns to the login screen
- Success criteria:
  - Board is inaccessible without login.
  - Login accepts the fixed credentials.
  - Logout returns to the login screen.
  - Auth gating is covered by focused, meaningful tests.
  - Avoid any tests that exist only to increase coverage.

## Phase 5: Storage design and database modeling

- Use SQLite local file storage and create the database if missing.
- Design a schema for:
  - user account
  - board metadata
  - columns with order and title
  - cards with title, description, labels, priority, optional due date
- Document the schema in `docs/`.
- Success criteria:
  - Schema is defined and documented.
  - The database is created on first run.

## Phase 6: Backend board API

- Add routes for board retrieval and updates.
- Support board state persistence in SQLite.
- Add backend unit tests for schema behavior and API routes.
- Success criteria:
  - API returns the user board state.
  - Updates persist to disk.
  - Backend tests pass.

## Phase 7: Frontend/backend integration

- Replace local seed state with API-driven board state.
- Wire board actions to backend endpoints for CRUD operations.
- Preserve the current interaction behavior while using real persistence.
- Add end-to-end tests covering login, board load, card add/delete, and move actions.
- Success criteria:
  - Board state persists across refresh.
  - Frontend uses backend API for board data.
  - End-to-end tests pass.

## Phase 8: Test coverage and release readiness

- Maintain at least 80% unit and integration coverage across frontend and backend where it is sensible to do so.
- Target the coverage goal with tests that add real value, not artificial assertions.
- Add or expand tests for:
  - frontend auth gating and board load behavior
  - backend persistence, API contract, and SQLite state updates
  - real user flows: login, board refresh, add/delete/move card, and logout
  - error and edge cases such as invalid board updates or missing state
- Keep test scope focused:
  - prefer integration tests for auth and persistence flows
  - prefer unit tests for board state helpers and API contracts
  - avoid tests that exist solely to exercise trivial branches or inflate metrics
  - if reaching 80% would require low-value assertions, keep the suite smaller and stronger
- Run Playwright or equivalent end-to-end tests for the core flow.
- Success criteria:
  - Coverage is at least 80% where sensible, with meaningful test coverage on auth, persistence, and board behavior.
  - Integration tests validate the end-to-end login and board state experience.
  - No tests are added just to hit the coverage number.

## Phase 9: AI connectivity (future scope)

- Add backend OpenRouter support using `OPENROUTER_API_KEY` from `.env`.
- Add a simple verification route for AI connectivity.
- Do not make AI required for core MVP functionality.
- Success criteria:
  - Backend can call the AI provider.
  - A simple AI test route returns a valid result.

## Phase 10: AI chat and structured board update (future scope)

- Plan a sidebar chat widget for user questions.
- Use structured AI outputs to optionally update the board.
- Ensure UI refreshes automatically when the board changes.
- Success criteria:
  - AI chat integrates without breaking core board behavior.
  - Structured outputs can modify board state safely.

## Verification checklist

- `frontend/AGENTS.md` exists.
- Backend scaffolding is complete and the frontend is served.
- Login gating works with fixed credentials.
- Board persistence is stored in SQLite and survives restart.
- Frontend and backend tests are implemented.
- Test coverage is at least 80% where sensible.
- The app remains local-only, single-user, and offline-friendly in behavior.

## Notes

- Keep the implementation simple and avoid extra features.
- No multi-user or board-switching flows.
- No external runtime dependencies beyond the AI phase.
- Preserve the existing frontend demo behavior while moving to a persistent backend.
