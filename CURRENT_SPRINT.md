# Personal OS — Current Sprint (Sprint 2)

## Sprint Focus: M2 — Projects & Milestones
- **Objective:** Implement complete end-to-end projects and milestones slice with dynamic progress computation, milestone lifecycle management, task linkage, REST Route Handlers, and responsive UI.
- **Status:** M2 Completed & Verified. Next Focus: M3 (Day Planner & Today Dashboard).

## Sprint 2 Completed Deliverables

- [x] **Task 2.1: Database Schema & Migration**
  - Created `db/migrations/0002_projects.sql` defining `projects` and `project_milestones` tables.
  - Linked `tasks(project_id)` foreign key to `projects(id)`.
  - Configured PostgreSQL Row-Level Security (RLS) with owner-isolated policies for SELECT, INSERT, UPDATE, DELETE on both projects and project_milestones.

- [x] **Task 2.2: Projects Domain Module**
  - Created `src/modules/projects/types.ts` for entities, milestones, and DTOs.
  - Created `src/modules/projects/schemas.ts` with strict Zod boundary validation.
  - Created `src/modules/projects/project.repository.ts` with in-memory and Supabase repository implementations.
  - Created `src/modules/projects/project.service.ts` with dynamic stats calculation (`completed_tasks / total_tasks * 100`, milestone stats, status management).

- [x] **Task 2.3: REST API Endpoints (`/api/v1/projects`)**
  - `GET /api/v1/projects`: list and filter projects with calculated progress and task counts.
  - `POST /api/v1/projects`: create project.
  - `GET /api/v1/projects/:id`: get project details with milestones and stats.
  - `PATCH /api/v1/projects/:id`: partial update (status, priority, dates).
  - `DELETE /api/v1/projects/:id`: delete project.
  - `GET /api/v1/projects/:id/tasks`: list tasks associated with project.
  - `GET /api/v1/projects/:id/milestones`: list milestones.
  - `POST /api/v1/projects/:id/milestones`: create milestone.
  - `PATCH /api/v1/projects/:id/milestones/:milestoneId`: toggle milestone completion.
  - `DELETE /api/v1/projects/:id/milestones/:milestoneId`: delete milestone.

- [x] **Task 2.4: UI Layer & Pages**
  - Created `src/components/projects/ProjectCard.tsx` with dynamic progress bar, task completion indicators, and priority badges.
  - Created `src/components/projects/ProjectFilterBar.tsx` with status tabs, search, and priority filter.
  - Created `src/components/projects/ProjectCreateDialog.tsx` modal for new project creation.
  - Created `src/components/projects/ProjectList.tsx` with responsive grid and empty state handling.
  - Created `src/components/projects/ProjectDetailView.tsx` with milestone timeline checklist, add milestone input, and linked tasks list.
  - Created `src/app/projects/page.tsx` and `src/app/projects/[id]/page.tsx` with Next.js Partial Prerendering and streaming Suspense boundaries.

- [x] **Task 2.5: Verification & Test Suite**
  - Schema boundary tests: `src/modules/projects/schemas.test.ts` (10 tests).
  - Service logic & isolation tests: `src/modules/projects/project.service.test.ts` (4 tests).
  - API Route Handler integration tests: `src/app/api/v1/projects/projects.api.test.ts` (7 tests).
  - UI component tests: `ProjectCard.test.tsx` (1 test) & `ProjectList.test.tsx` (4 tests).
  - Vitest test suite: **69/69 tests passing** across 15 test files.
  - ESLint: **0 errors, 0 warnings**.
  - TypeScript: **0 errors**.
  - Next.js Production Build: **Exit code 0** (`next build`).
  - Playwright live UI inspection: Desktop (1440px) and Mobile (375px) verified with clean layouts and accessible dialogs.
