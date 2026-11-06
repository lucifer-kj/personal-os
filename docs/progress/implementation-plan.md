# Personal OS — Milestone Implementation Plan

**Author:** Antigravity Lead Architect  
**Status:** Living Engineering Plan  
**Target Architecture:** Modular Monolith (Next.js 16 App Router, React 19, Tailwind CSS v4, Supabase PostgreSQL with RLS)

---

## Architecture Principles & Guardrails
1. **Spec-first Execution:** Work milestone-by-milestone. Never advance to M1 until M0 is verified.
2. **Warm Editorial Design Language:** Use warm neutral backgrounds (`#f8f5f0`), dark charcoal text (`#24211f`), restrained terracotta primary accents (`#b84318`), generous 4px-grid spacing, and quiet typography. Avoid artificial gradients, glow effects, or decorative clutter.
3. **Strict Domain Boundaries:**
   - `src/modules/<domain>/`: Domain entities, validation schemas, repository access, and business services.
   - `src/app/api/v1/<domain>/`: Boundary adapters / route handlers enforcing session auth, input validation, and standard response envelopes `{ data, meta }` or `{ error }`.
   - `src/components/`: Reusable primitives (`ui/`) and shell structures (`layout/`, `navigation/`).
4. **Verifiable Quality Floor:** Lint, typecheck, tests, and build must pass before any milestone is marked DONE. Responsive inspection across 375px mobile, 768px tablet, and 1280px+ desktop is mandatory.

---

## Milestone 0: App Foundation & Infrastructure (Current)

### Scope
- Next.js App Router initialization with TypeScript strict mode and pnpm.
- Design token integration from `index.css` into `src/app/globals.css`.
- Application shell (`DesktopSidebar`, `MobileNav`, `TopHeader`, `WorkspaceSwitcher`).
- Responsive layout primitives (`PageShell`, `PageHeader`, `Card`, `Button`, `Badge`).
- Tooling setup: ESLint, Prettier, TypeScript `tsc --noEmit`, Vitest test runner.
- Baseline git repository structure and initial progress tracking files.

### Dependencies
- Node.js 20+, pnpm 12+
- Packages: `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/turbopack`, `clsx`, `tailwind-merge`, `lucide-react`, `zod`, `vitest`, `@testing-library/react`.

### Files / Modules Affected
- `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`
- `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- `src/lib/utils.ts` (classnames `cn`)
- `src/components/layout/` (`AppShell.tsx`, `Header.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, `PageShell.tsx`)
- `src/components/ui/` (`button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`)
- `PROJECT_STATUS.md`, `MILESTONE_TRACKER.md`, `CURRENT_SPRINT.md`, `BLOCKERS.md`

### Acceptance Criteria
- [ ] Application compiles and builds cleanly (`pnpm build`).
- [ ] Typecheck passes with zero errors (`pnpm typecheck`).
- [ ] Linter passes with zero warnings/errors (`pnpm lint`).
- [ ] Foundation unit tests pass (`pnpm test`).
- [ ] App shell renders sidebar on desktop (>=1024px) and mobile navigation (<1024px) with no horizontal scroll or layout clipping.
- [ ] Color tokens, fonts, and spacing faithfully reproduce the warm editorial palette.

### Tests Required
- Shell rendering tests (sidebar rendered on desktop, drawer/bottom bar on mobile).
- Layout primitive tests (Card, Button, Badge states).
- Utility helper tests (`cn` class merger).

### Risks
- Responsive drawer clashing with page content.
- Missing fonts in headless testing environment.

### Completion Conditions
All M0 acceptance criteria verified, tests passing, and git commit created.

---

## Milestone 1: Task Management (First Vertical Slice)

### Scope
- Task domain schema in Supabase PostgreSQL: `tasks` table with user ownership, title, notes, status (`todo`, `in_progress`, `completed`, `cancelled`), priority (`low`, `medium`, `high`, `urgent`), due date, completion timestamp, sort order.
- PostgreSQL Row-Level Security (RLS) policies enforcing single-user data isolation.
- Zod validation schemas for task creation, update, filtering, and status transitions.
- Task repository and domain service layer (`src/modules/tasks/`).
- REST Route Handlers under `/api/v1/tasks` (GET list, POST create, GET :id, PATCH :id, DELETE :id, POST :id/complete, POST :id/reopen).
- Task UI:
  - Task list view with status filter tabs (All, Active, Completed).
  - Task creation form with title, priority, due date.
  - Interactive completion toggle with optimistic update.
  - Responsive task item card / row.
  - Empty states, loading skeletons, and error handling states.

### Dependencies
- Milestone 0 (App Shell and UI Primitives).
- Supabase client abstraction (`src/lib/supabase/`).

### Files / Modules Affected
- `db/migrations/0001_tasks.sql`
- `src/modules/tasks/` (`types.ts`, `schemas.ts`, `task.repository.ts`, `task.service.ts`)
- `src/app/api/v1/tasks/route.ts`, `src/app/api/v1/tasks/[id]/route.ts`, `src/app/api/v1/tasks/[id]/complete/route.ts`
- `src/app/(app)/tasks/page.tsx`
- `src/components/tasks/` (`TaskList.tsx`, `TaskItem.tsx`, `TaskCreateDialog.tsx`, `TaskFilterBar.tsx`)

### Acceptance Criteria
- [ ] Tasks can be created, listed, updated, completed, reopened, and deleted.
- [ ] User ownership strictly enforced via session auth and database RLS.
- [ ] Validation errors return HTTP 422/400 with standard error envelope.
- [ ] UI provides instant feedback, loading skeletons, and accessible keyboard navigation.
- [ ] Mobile viewport (375px) renders clean task list with touch-friendly controls (min 44px hit targets).

### Tests Required
- Schema validation unit tests (Zod boundary tests).
- Task service unit tests (business logic, status transitions, sort ordering).
- API route handler integration tests (auth verification, envelope format, error codes).
- UI component tests (render, toggle complete, submit form, empty state).

### Risks
- Auth session mocking in test environment.
- Handling timezone-sensitive due dates accurately without date shifts.

### Completion Conditions
Full end-to-end task slice working and tested; zero regressions in foundation; test suite green.

---

## Milestone 2: Projects & Milestones

### Scope
- `projects` and `project_milestones` tables, RLS, domain service, `/api/v1/projects` routes.
- Project status: `planning`, `active`, `on_hold`, `completed`, `archived`.
- Project detail page with overview, linked task list, milestone progress bar, and notes.

### Dependencies
- M1 (Tasks Module).

---

## Milestone 3: Day Planner & Today Dashboard

### Scope
- Today view bringing together daily intention, agenda items, high-priority tasks, and quick capture.
- `/api/v1/dashboard` and `/api/v1/day` endpoints.
- Desktop 2-column balanced layout; single-column mobile flow.

### Dependencies
- M1 (Tasks), M2 (Projects).

---

## Milestone 4: Focus Sessions & Time Tracking

### Scope
- `focus_sessions` table, state machine (`running`, `paused`, `completed`, `abandoned`), server-authoritative timer transition API.
- Reconcile clock-drift between client and server.
- Focus widget in header/sidebar and dedicated focus screen.

### Dependencies
- M1 (Tasks).

---

## Milestone 5: Inbox & Quick Capture

### Scope
- Universal quick-capture shortcut and modal accessible from anywhere.
- Unsorted capture triage into task, project, note, or event.
- Zero-friction capture (<3 seconds).

### Dependencies
- M0 (Shell), M1 (Tasks).

---

## Milestone 6: Calendar & Time Blocking

### Scope
- Calendar events table, UTC storage with local timezone preservation.
- Day, week, and agenda view primitives.
- Conflict advisory indicators without hard-blocking.

### Dependencies
- M0 (Shell), M1 (Tasks).

---

## Milestone 7: Notes & Knowledge Base

### Scope
- Notes table, Markdown content, tag taxonomy, linking to tasks/projects.
- Note search, filter, and editor view.

### Dependencies
- M0 (Shell).

---

## Milestone 8: Habits & Journal

### Scope
- Daily habits checklist with consistency streaks.
- Daily reflective journal entries.

### Dependencies
- M0 (Shell).

---

## Milestone 9: Global Search & Command Palette

### Scope
- `cmdk` palette accessible via `Cmd+K` / `Ctrl+K`.
- Unified search over tasks, projects, notes, and quick navigation.

### Dependencies
- M0 through M8.
