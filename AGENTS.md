# The Project Management MVP web app

## Project Overview
 
A lightweight, single-user Kanban board application designed to run locally on a personal machine. The app allows one authenticated user to manage a single Kanban board with full task lifecycle support — from backlog to completion.

---

## Business Requirements
This project is building a Project Management App. Key features: 
- Users can sign in
- When signed in, the user sees a Kanban board representing their project
- The Kanban board 

 
### Core Functionality
 
- **User Authentication**: The application must support a single-user login system. The user must authenticate before accessing the board.
- **Kanban Board**: The authenticated user has access to exactly one Kanban board. The board must support the following default columns:
  - `Backlog`
  - `To Do`
  - `In Progress`
  - `Review`
  - `Done`
- **Task (Card) Management**:
  - Create new tasks with a title, description, priority level, and optional due date
  - Edit existing task details
  - Move tasks between columns via drag-and-drop or manual column selection
  - Delete tasks with a confirmation prompt
  - Assign labels or tags to tasks (e.g., `bug`, `feature`, `urgent`)
- **Column Management**:
  - Add custom columns
  - Rename existing columns
  - Reorder columns via drag-and-drop
  - Delete columns (only if empty)
- **Persistence**: All board data must persist across sessions using local storage or a local database file (e.g., SQLite or JSON flat file)
- **Offline-First**: The application must be fully functional without an internet connection
### Nice-to-Have (Future Scope)
 
- Task due date reminders
- Task filtering by label, priority, or due date
- Board activity log / history
- Export board to CSV or JSON
- Dark mode toggle
 
## Limitations
 
These are hard constraints that define the boundaries of the application. Do not build beyond these without explicit instruction.
 
### 1. Single User Only
- The application supports **exactly one user account**
- There is no multi-user support, no user roles, and no admin panel
- Registration of new users is disabled after the initial setup
- If no user exists, the app presents a one-time setup screen to create the single account
### 2. Single Kanban Board Per User
- The authenticated user can access **only one Kanban board**
- There is no board-switching, board creation flow, or board listing screen
- The user lands directly on their board after login
- Board deletion is not supported through the UI (must be done manually if needed)
### 3. Local Only
- The application is designed to **run locally** on the user's machine only
- There is no cloud sync, no remote database, no external API calls
- No deployment pipeline, Docker setup, or hosting configuration is required
- Network access is not required at runtime
### 4. No Real-Time Collaboration
- There are no WebSockets, live updates, or shared sessions
- Only one browser session should be active at a time
### 5. No Mobile Optimization (Initial Scope)
- The app is optimized for desktop browsers only (minimum 1024px width)
- Responsive/mobile layout is out of scope for the initial version


## Technical Details

- NextJS frontend
- Python FastAPI backend, including serving the static NextJS site at /
- Everything packaged into a Docker container
- Use "uv" as the package manager for python in the Docker container
- Use OpenRouter for the AI calls. An OPENROUTER_API_KEY is in .env in the project root
- Use 'openai/gpt-oss-120b:free' as the model
- Use SQLLite local database for the database, creating a new db if it doesn't exit
- Start and Stop server scripts for Mac, PC, Linux in scripts/

## Starting point

A working MVP of the frontend has been built and is already in frontend. This is not yet designed for the Docker setup. It's a pure frontend-only demo

## Color Scheme

- Accent Yellow: `#ecad0a` - accent lines, highlights
- Blue Primary: `#209dd7` - links, key sections
- Purple Secondary: `#753991` - submit buttons, important actions
- Dark Navy: `#032147` - main headings
- Gray Text: `#888888` - supporting text, labels

## Strategy

1. Write plan with success criteria for each phase to be checked off. Include project scaffolding, including .gitignore, and rigorous unit testing.
2. Execute the plan ensuring all critiera are met
3. Carry out extensive integration testing with Playwright or similar, fixing defects
4. Only complete when the MVP is finished and tested, with the server running and ready for the user

## Coding standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever
4. When hitting issues, always identify root cause before trying a fix. Do not guess. Prove with evidence, then fix the root cause

## Working documentation

All documents for planning and executing this project will be in the docs/directory. Please review the docs/PLAN.md document before proceeding.