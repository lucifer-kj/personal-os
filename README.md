# Personal OS

> A calm, private, single-user productivity workstation built with Next.js 16 (App Router, Turbopack, React 19, Tailwind CSS v4) and Supabase PostgreSQL.

Personal OS is an enclave workstation created specifically for personal daily execution: task management, focus sessions, project milestones, time blocking, note-taking with wiki-links, habit tracking, mood journaling, and global keyboard-driven navigation (`Cmd+K`).

---

## Architecture & System Overview

- **Single-User Enclave:** Designed exclusively for verified owner `321arifali@gmail.com`. Guarded by PostgreSQL trigger `trg_prevent_multiple_users` on `auth.users` to permanently forbid unauthorized signups.
- **Fail-Closed Security & RLS:** All database entities enforce `user_id = auth.uid()` across `SELECT`, `INSERT`, `UPDATE`, and `DELETE` with explicit `RESTRICTIVE` policies and `security_invoker = true` views.
- **Authentication & MFA:**
  - WebAuthn / Passkeys authentication.
  - Multi-Factor Authentication (MFA) via Google Authenticator TOTP (AAL2 verification with enforced grace periods).
  - Active device session management and token revocation via `/api/v1/auth/devices`.
- **Atomic Operations & Performance:**
  - Atomic Inbox Triage implemented via database RPC (`triage_inbox_item_to_task_tx`) guaranteeing zero data corruption or partial conversions.
  - Accelerated search via PostgreSQL Full-Text Search (FTS) indices with GIN indexes and English tsvector configurations.
  - Next.js 16 Partial Prerendering (PPR) with streaming `<Suspense>` boundaries across all core views.
- **Observability:**
  - Production readiness probe at `/api/v1/health` verifying database connectivity, storage state, and latency in real-time.
- **Private Meta & Favicon:**
  - Custom SVG/ICO favicon, PWA web manifest, apple-touch-icon, and privacy-preserving robots metadata (`noindex, nofollow, noarchive`).

---

## Core Workstation Modules

1. **Dashboard (`/`):** Daily intention setting, chronological agenda, overdue task indicators, active project metrics, thinking orb canvas (`AppOrb`), and client-synchronized dynamic scenery (`DynamicScenery`).
2. **Tasks (`/tasks`):** Priority taxonomy, status transitions (`todo`, `in_progress`, `completed`, `cancelled`), tags, project associations, and time estimates.
3. **Projects (`/projects`):** Milestones, deliverables, and dynamic task-based progress calculation.
4. **Focus Sessions (`/focus`):** Server-authoritative Pomodoro and stopwatch timers, clock-drift resilience, time rollups into tasks, and thinking orb states (`breathing`, `weaving`, `searching`, `solving`, `resting`).
5. **Inbox (`/inbox`):** Rapid capture modal (< 3s latency) and atomic database triage to tasks, notes, or calendar events.
6. **Calendar (`/calendar`):** Month, Week, Day, and Agenda views with UTC instant storage, local timezone translation, and non-blocking conflict advisory.
7. **Notes (`/notes`):** Markdown editor with live preview, GIN-indexed tag taxonomy, and bidirectional `[[wiki-link]]` resolution.
8. **Habits & Journal (`/habits`, `/journal`):** Daily checklist, streak calculation with grace periods, 5-point discrete mood scaling, and rolling mood analytics.
9. **Universal Search & Command Palette:** Global `cmdk` palette (`Cmd+K` / `Ctrl+K`) with FTS scoring and quick actions.
10. **Device & Security Management (`/settings/devices`):** Session inspection, location tracking, and remote device revocation.

---

## Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Styling:** Tailwind CSS v4 (`@theme inline` editorial tokens)
- **Database:** Supabase PostgreSQL with RLS, FTS GIN indexes, and PL/pgSQL RPCs
- **Validation:** Zod schemas across all boundaries
- **Testing:** Vitest & React Testing Library (50+ high-signal domain, API, and view suites)
- **Package Manager:** `pnpm` exclusively

---

## Local Development

```bash
# Install dependencies
pnpm install

# Run development server with Turbopack
pnpm dev

# Run TypeScript typechecks
pnpm typecheck

# Run test suite
pnpm test

# Run production build
pnpm build
```

---

## Structural Knowledge Graph

A complete structural knowledge graph is maintained in `graphify-out/`:
- `graphify-out/graph.json` — Structural node and edge definitions.
- `graphify-out/GRAPH_REPORT.md` — Topological analysis and community clusters.
- `graphify-out/graph.html` — Interactive visualizer.
