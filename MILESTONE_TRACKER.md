# Personal OS — Milestone Tracker

| Milestone | Title | Scope | Status | Verification Criteria |
|---|---|---|---|---|
| **M0** | **App Foundation & Tooling** | Repository init, design tokens, app shell, header, responsive navigation, layout primitives, base UI components, lint/typecheck/test/build pipelines. | **COMPLETED & VERIFIED** | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pass. Shell responsive across 375px, 768px, 1280px, 1440px. |
| **M1** | **Task Management (Vertical Slice)** | Task schema, RLS policies, Zod validation, repository/service layer, REST `/api/v1/tasks` endpoints, Task UI (list, filter, create/edit dialog, status toggle, empty/error/loading states). | **COMPLETED & VERIFIED** | Unit tests, API integration tests, and UI interaction tests passing with 100% boundary validation (43/43 tests pass). Playwright desktop & mobile verified. |
| **M2** | **Projects & Milestones** | Project schema, RLS, service layer, project detail views, milestone tracking, task association. | **READY TO START** | Projects CRUD, milestone completion workflows, owner isolation verified. |
| **M3** | **Day Planner & Today Dashboard** | Today agenda, time blocks, focus intention, chronological timeline, summary cards. | PENDING | Real-time agenda calculations, time-zone awareness, verified on mobile/desktop. |
| **M4** | **Focus Sessions & Time Tracking** | Focus timer, server-authoritative session transitions, pause/resume tracking, task time rollups. | PENDING | Timer resilience, clock-drift reconciliation tests pass. |
| **M5** | **Inbox & Quick Capture** | Global quick capture modal/drawer, unorganized inbox triage, conversion to tasks/notes/events. | PENDING | < 3s capture latency, triage conversion integrity verified. |
| **M6** | **Calendar & Time Blocking** | Event schema, UTC instant conversion, day/week/month/agenda views, task scheduling. | PENDING | Timezone consistency checks, conflict advisory indicators verified. |
| **M7** | **Notes & Knowledge Base** | Markdown/notes storage, tags, basic linking to tasks/projects. | PENDING | Sanitization, link referential integrity tested. |
| **M8** | **Habits & Journal** | Daily habits checklist, streaks, reflection journal entries. | PENDING | Daily rollover and streak recalculation tests pass. |
| **M9** | **Global Search & Command Palette** | `cmdk` command palette, full-text search across tasks, projects, notes. | PENDING | Keyboard accessibility (Cmd+K), keyboard navigation verified. |
