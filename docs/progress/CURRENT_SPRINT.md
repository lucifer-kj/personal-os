# Personal OS — Current Sprint (Sprint 5)

## Sprint Focus: M5 — Inbox & Quick Capture
- **Objective:** Implement complete end-to-end Inbox and Quick Capture module with database migration (`0005_inbox_items.sql`), Zod schemas, repository layer, domain service with atomic triage conversion into Tasks, REST Route Handlers (`/api/v1/inbox`), `QuickCaptureModal` dialog, and dedicated `/inbox` triage screen.
- **Status:** M5 Completed & Verified. Next Focus: M6 (Calendar & Time Blocking).

## Sprint 5 Completed Deliverables

- [x] **Task 5.1: Database Schema & Migration**
  - Created `db/migrations/0005_inbox_items.sql` defining `inbox_items` table conforming to Supabase Database Spec Section 10.1.
  - Implemented capture types: `task`, `note`, `idea`, `link`, `reminder`, `other`.
  - Configured PostgreSQL Row-Level Security (RLS) with owner-isolated policies for SELECT, INSERT, UPDATE, DELETE.

- [x] **Task 5.2: Inbox Domain Module & Service Layer**
  - Created `src/modules/inbox/types.ts` and `src/modules/inbox/schemas.ts` with strict Zod boundary validation.
  - Created `src/modules/inbox/inbox.repository.ts` with in-memory and Supabase database repository implementations.
  - Created `src/modules/inbox/inbox.service.ts` with atomic conversion (`processItem`) that creates the target task with `source_type: "inbox"` and `source_id: item.id`, and updates the inbox record to `processed`.

- [x] **Task 5.3: REST API Endpoints (`/api/v1/inbox`)**
  - `GET /api/v1/inbox`: Filter by status (`unprocessed`, `processed`, `all`), capture type, and search keyword.
  - `POST /api/v1/inbox`: Rapid single-call capture with type, optional content and URL.
  - `GET /api/v1/inbox/[id]`: Retrieve single captured item.
  - `PATCH /api/v1/inbox/[id]`: Edit captured title, content, type, or status.
  - `POST /api/v1/inbox/[id]/process`: Atomically triage into a task with priority and due date.
  - `DELETE /api/v1/inbox/[id]`: Remove item.

- [x] **Task 5.4: UI Layer & Inbox Experience**
  - Created `src/components/inbox/QuickCaptureModal.tsx`:
    - Auto-focus on mount (< 3s capture latency).
    - Type selector chips (Idea, Task, Note, Link, Reminder).
    - Escape to dismiss, Enter to submit.
  - Created `src/components/inbox/InboxList.tsx`:
    - Tab filters: Unprocessed, Processed, All Captures.
    - One-click "Convert to Task" conversion button.
    - External URL click-through, type badges, and dismiss button.
    - Calm "Inbox Zero" empty state.
  - Created `src/components/inbox/InboxView.tsx` and `src/app/inbox/page.tsx` with Next.js 16 Partial Prerendering and streaming Suspense.

- [x] **Task 5.5: Verification & Test Suite**
  - Schema tests: `src/modules/inbox/schemas.test.ts` (3 tests).
  - Service unit tests: `src/modules/inbox/inbox.service.test.ts` (4 tests).
  - API Route Handler integration tests: `src/app/api/v1/inbox/inbox.api.test.ts` (1 test).
  - Component tests: `src/components/inbox/InboxList.test.tsx` (3 tests).
  - Total Vitest test suite: **116/116 tests passing** across 30 test files.
  - ESLint: **0 errors, 0 warnings**.
  - TypeScript: **0 errors**.
  - Next.js Production Build: **Exit code 0** (`next build`).
  - Playwright visual inspection: Desktop and Mobile verified with live capture modal and inbox list.
