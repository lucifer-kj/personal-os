# Personal OS — Project Status

## Overview
- **Product Name:** Personal OS
- **Status:** M2 Projects & Milestones Completed & Verified. Ready for M3 (Day Planner & Today Dashboard).
- **Architecture Baseline:** Modular monolith with Next.js App Router (React 19, TypeScript strict mode, Tailwind CSS v4), Supabase PostgreSQL, and explicit domain module boundaries.
- **Visual Direction:** Warm, editorial, quiet, spacious, functional. Design tokens active in `src/app/globals.css`.

## Milestones Summary
- **M0 — Foundation & Tooling:** COMPLETED & VERIFIED
- **M1 — Task Management (First Vertical Slice):** COMPLETED & VERIFIED
- **M2 — Projects & Milestones:** COMPLETED & VERIFIED
- **M3 — Day Planner & Today Dashboard:** READY TO START

## Key Verification Status
- Lint: PASSED (`pnpm lint` — 0 errors, 0 warnings)
- Typecheck: PASSED (`pnpm typecheck` — 0 errors)
- Tests: PASSED (`pnpm test` — 69/69 unit, domain, API, and component tests passing)
- Build: PASSED (`pnpm build` — Clean production build with Partial Prerendering on `/projects/[id]` and static `/projects`)
- Viewport Inspection: VERIFIED (Desktop 1440px and Mobile 375px verified with Playwright snapshot; project creation dialog, filter tabs, responsive navigation verified)

## Architecture Decisions Record (ADR) Summary
- **ADR-001 (Tooling & Package Manager):** `pnpm` exclusively used. Next.js 16 App Router with React 19, TypeScript in strict mode, ESLint 9, and Vitest for testing.
- **ADR-002 (Design Tokens & CSS):** Adopted Tailwind CSS v4 `@theme inline` tokens with the warm editorial palette (`--background: #f8f5f0`, `--foreground: #24211f`, `--primary: #b84318`), typography scales, and 4px spacing scale.
- **ADR-003 (Module Boundaries):** `src/modules/<domain>` for domain services, schemas, and repository layer; `src/app/api/v1/<domain>` for route handlers; `src/components` for shell and reusable UI primitives.
- **ADR-004 (Data & Auth Foundation):** Supabase Auth with PostgreSQL Row-Level Security (RLS) as authoritative store. Mock/offline-safe local client abstractions ensuring test suites and local sandboxes run without external network dependencies.
- **ADR-005 (Task Domain Invariants):** Authoritative task status transitions (`todo`, `in_progress`, `completed`, `cancelled`) in domain service with automated `completed_at` timestamp synchronization; owner-scoped RLS policies.
- **ADR-006 (Projects & Dynamic Progress Rules):** Project progress is strictly computed dynamically from attached tasks (`completed_tasks / total_tasks * 100`) or 100% when marked completed. No fake or arbitrary percentages. Project milestones support chronological and phase-based roadmaps with task linkage. Next.js Partial Prerendering (PPR) streaming pattern applied to dynamic `[id]` pages with Suspense boundaries.
