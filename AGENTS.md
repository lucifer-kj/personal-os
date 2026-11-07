<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Personal OS — Architecture & Context Map

Personal OS is a calm, private single-user productivity workstation built with Next.js 16 (Turbopack, React 19, Tailwind CSS v4) and Supabase Postgres.

### 1. Structural Knowledge Graph (Graphify)
- Knowledge graph available at `graphify-out/graph.json` (1048 nodes, 3872 edges, 34 communities).
- High-level topology, community clusters, and god nodes: `graphify-out/GRAPH_REPORT.md`.
- Interactive visualizer: `graphify-out/graph.html`.
- Run `graphify query "<question>"` to trace dependencies or explain nodes without re-reading source files.

### 2. Single-User Security & Authentication
- **Enclave Mode:** Single-user app claimed by verified owner `321arifali@gmail.com`.
- **Database Guard:** PostgreSQL trigger `trg_prevent_multiple_users` on `auth.users` blocks all subsequent signups.
- **Client Route Guards:** Next.js middleware in `src/middleware.ts` redirects unauthenticated traffic to `/login`.
- **Database RLS:** All tables (`tasks`, `projects`, `focus_sessions`, `inbox_items`, `daily_plans`, `time_entries`, `calendar_events`, `notes`, `note_links`, `habits`, `habit_logs`, `journal_entries`) enforce `user_id = auth.uid()` across SELECT, INSERT, UPDATE, DELETE.

### 3. Core Module Map
- **Tasks (`/tasks`):** `src/modules/tasks/` — Domain types, Zod schemas, repository, service, and API routes (`/api/v1/tasks`).
- **Focus (`/focus`):** `src/modules/focus/` — Pomodoro & stopwatch session engine, state machine, and thinking orb states (`breathing`, `weaving`, `searching`, `solving`, `resting`).
- **Inbox (`/inbox`):** `src/modules/inbox/` — Quick capture, frictionless triage into tasks or projects.
- **Projects (`/projects`):** `src/modules/projects/` — Milestone tracking, project progress, and associated tasks.
- **Calendar (`/calendar`):** `src/modules/calendar/` — Multi-view scheduling, time blocking, and non-blocking conflict advisory.
- **Notes (`/notes`):** `src/modules/notes/` — Markdown knowledge base, tag taxonomy, note-to-note linking, and wiki-link resolution.
- **Habits (`/habits`):** `src/modules/habits/` — Daily consistency engine, streak calculation, check-in logs, and API routes (`/api/v1/habits`).
- **Journal (`/journal`):** `src/modules/journal/` — Reflective journaling, 5-point mood scaling, prompt responses, rolling mood trends, and API routes (`/api/v1/journal`).
- **Dashboard (`/`):** `src/components/dashboard/` — Daily intention, agenda, and metrics overview.
- **App Shell & Theme:** `src/components/layout/` (`Sidebar`, `Header`, `MobileNav`, `AppShell`) with warm editorial design tokens.

