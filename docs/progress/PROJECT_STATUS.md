# Personal OS — Project Status

## Overview
- **Product Name:** Personal OS
- **Status:** M8 Habits & Journal Completed & Verified. Ready for M9 (Global Search & Command Palette).
- **Architecture Baseline:** Modular monolith with Next.js App Router (React 19, TypeScript strict mode, Tailwind CSS v4), Supabase PostgreSQL, and explicit domain module boundaries.
- **Visual Direction:** Warm, editorial, quiet, spacious, functional. Design tokens active in `src/app/globals.css`.

## Milestones Summary
- **M0 — Foundation & Tooling:** COMPLETED & VERIFIED
- **M1 — Task Management (First Vertical Slice):** COMPLETED & VERIFIED
- **M2 — Projects & Milestones:** COMPLETED & VERIFIED
- **M3 — Day Planner & Today Dashboard:** COMPLETED & VERIFIED
- **M4 — Focus Sessions & Time Tracking:** COMPLETED & VERIFIED
- **M5 — Inbox & Quick Capture:** COMPLETED & VERIFIED
- **M6 — Calendar & Time Blocking:** COMPLETED & VERIFIED
- **M7 — Notes & Knowledge Base:** COMPLETED & VERIFIED
- **M8 — Habits & Journal:** COMPLETED & VERIFIED
- **M9 — Global Search & Command Palette:** READY TO START

## Key Verification Status
- Lint: PASSED (`pnpm lint` — 0 errors, 0 warnings)
- Typecheck: PASSED (`pnpm typecheck` — 0 errors)
- Tests: PASSED (`pnpm test` — 181/181 unit, domain, API, and component tests passing across 46 test files)
- Build: PASSED (`pnpm build` — Clean production build with Partial Prerendering on `/`, `/calendar`, `/focus`, `/habits`, `/inbox`, `/journal`, `/notes`, `/projects/[id]`, and static `/projects` & `/tasks`)
- Viewport Inspection: VERIFIED (Desktop 1440px and Mobile 375px; habit check-in, streak badge display, mood selector pills, prompt responses, and calendar strip navigation verified)

## Architecture Decisions Record (ADR) Summary
- **ADR-001 (Tooling & Package Manager):** `pnpm` exclusively used. Next.js 16 App Router with React 19, TypeScript in strict mode, ESLint 9, and Vitest for testing.
- **ADR-002 (Design Tokens & CSS):** Adopted Tailwind CSS v4 `@theme inline` tokens with the warm editorial palette (`--background: #f8f5f0`, `--foreground: #24211f`, `--primary: #b84318`), typography scales, and 4px spacing scale.
- **ADR-003 (Module Boundaries):** `src/modules/<domain>` for domain services, schemas, and repository layer; `src/app/api/v1/<domain>` for route handlers; `src/components` for shell and reusable UI primitives.
- **ADR-004 (Data & Auth Foundation):** Supabase Auth with PostgreSQL Row-Level Security (RLS) as authoritative store. Mock/offline-safe local client abstractions ensuring test suites and local sandboxes run without external network dependencies.
- **ADR-005 (Task Domain Invariants):** Authoritative task status transitions (`todo`, `in_progress`, `completed`, `cancelled`) in domain service with automated `completed_at` timestamp synchronization; owner-scoped RLS policies.
- **ADR-006 (Projects & Dynamic Progress Rules):** Project progress is strictly computed dynamically from attached tasks (`completed_tasks / total_tasks * 100`) or 100% when marked completed. No fake or arbitrary percentages. Project milestones support chronological and phase-based roadmaps with task linkage. Next.js Partial Prerendering (PPR) streaming pattern applied to dynamic `[id]` pages with Suspense boundaries.
- **ADR-007 (Day Planner & Today Dashboard Composition):** Daily plan persisted with user-isolated `daily_plans` table (`0003_daily_plans.sql`). Dashboard synthesizes today's scheduled agenda, overdue warning callouts, active project deliverables, and real-time focus metrics. Server components leverage `await connection()` inside `<React.Suspense>` streaming boundaries to handle per-request dynamic rendering under Next.js 16 Partial Prerendering.
- **ADR-008 (Orb & Dynamic Scenery System):** Installed `thinking-orbs` for an interactive, canvas-driven animated state orb (`AppOrb`) embedded into the hero dashboard card and brand elements. Integrated SVG dynamic scenery (`DynamicScenery`) that transitions through dawn, day, dusk, and night based on real-time client hour with soft warm gradient blend. Client mounting handled via `useSyncExternalStore` for React 19 / Next.js 16 hydration safety.
- **ADR-009 (Focus Sessions & Time Tracking Engine):** Server-authoritative timer tracking in `time_entries` and `focus_sessions` tables (`0004_focus_sessions.sql`). Clock-drift and tab-sleep resilience implemented by computing elapsed time from server UTC timestamps and accumulated pause duration. Automatic duration rollup commits tracked focus minutes into linked task `actual_minutes` upon session completion. Dedicated `/focus` view synchronizes dynamic `AppOrb` states (`working`, `breathing`, `composing`).
- **ADR-010 (Inbox & Quick Capture Architecture):** Unprocessed information captured first into `inbox_items` (`0005_inbox_items.sql`) with capture types (`task`, `note`, `idea`, `link`, `reminder`, `other`). Rapid capture modal with auto-focused inputs supports single-keystroke entry (< 3s capture latency). Atomic triage conversion converts inbox records into domain tasks (`source_type: "inbox"`, `source_id: item.id`) and marks the inbox item processed in a single transaction-like workflow.
- **ADR-011 (Calendar & Time Blocking Engine):** Timestamps stored in authoritative UTC `timestamptz` format in `calendar_events` (`0006_calendar_events.sql`) while preserving client origin IANA timezone. Advisory conflict detection calculates overlaps (`e1.start_at < e2.end_at AND e1.end_at > e2.start_at`) and surfaces non-blocking amber badges in modals and views without artificially restricting the user from booking commitments. Time blocking seamlessly links calendar events to task records (`task_id`), synchronizing `scheduled_start_at` and `scheduled_end_at` fields on the task. View orchestrator delivers responsive Month, Week, Day, and Agenda views with Partial Prerendering support.
- **ADR-012 (Notes, Tag Taxonomy & Knowledge Graph Links Architecture):** Notes are stored with Markdown or plain text formats in `notes` (`0007_notes.sql`) with structured metadata (`note_type`, `project_id`, `task_id`, `is_pinned`, `is_archived`). Tag indexing is accelerated using a PostgreSQL GIN index on the `text[]` column, allowing instant multi-tag filtering and taxonomy aggregation. Inter-note knowledge connections are managed via `note_links` with explicit forward links, backlinks, and bidirectional links, as well as automatic `[[wiki-link]]` discovery upon note content saves. The UI offers live markdown split and preview modes with zero third-party client bundle bloat, responsive search and filtering, and Next.js 16 Partial Prerendering on `/notes`.
- **ADR-013 (Habits Consistency Engine, Streak Tracking & Reflective Journaling Architecture):** Habit routines and completion logs are stored in `habits` and `habit_logs` tables (`0008_habits_and_journal.sql`) with strict unique constraints on `(user_id, habit_id, date)`. Streaks are calculated using normalized local ISO dates (`YYYY-MM-DD`) with grace periods for today's pending state, preventing UTC day boundary shifts. Journal reflections are stored in `journal_entries` with an upsert semantic per calendar date, featuring a 5-point discrete mood scale, structured prompt response JSONB, and rolling mood analytics (`/api/v1/journal/trends`). Next.js 16 Partial Prerendering powers `/habits` and `/journal` with streaming Suspense.
