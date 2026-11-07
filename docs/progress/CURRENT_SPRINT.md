# Personal OS — Current Sprint (Sprint 6)

## Sprint Focus: M6 — Calendar & Time Blocking
- **Objective:** Implement complete end-to-end Calendar and Time Blocking module with database migration (`0006_calendar_events.sql`), Zod boundary schemas, repository layer (InMemory and Supabase), domain service with advisory conflict detection and task scheduling synchronization, REST Route Handlers (`/api/v1/calendar/*`), interactive multi-view calendar UI (`MonthView`, `WeekView`, `DayView`, `AgendaView`), `EventModal`, `TimeBlockDrawer`, and dedicated `/calendar` workstation page.
- **Status:** M6 Completed & Verified. Next Focus: M7 (Notes & Knowledge Base).

## Sprint 6 Completed Deliverables

- [x] **Task 6.1: Database Schema & Migration**
  - Created `db/migrations/0006_calendar_events.sql` defining `calendar_events` table conforming to Supabase Database Spec Section 7.1.
  - Configured event types: `personal`, `focus`, `meeting`, `reminder`, `external`.
  - Added range constraint `end_at > start_at` and external event uniqueness constraint.
  - Implemented indexes on `(user_id, start_at, end_at)` and `(user_id, event_type)`.
  - Configured PostgreSQL Row-Level Security (RLS) with owner-isolated policies for SELECT, INSERT, UPDATE, DELETE.

- [x] **Task 6.2: Calendar Domain Module & Service Layer**
  - Created `src/modules/calendar/types.ts` and `src/modules/calendar/schemas.ts` with strict Zod boundary validation.
  - Created `src/modules/calendar/calendar.repository.ts` with in-memory and Supabase repository implementations.
  - Created `src/modules/calendar/calendar.service.ts`:
    - Non-blocking conflict advisory detection (`detectConflicts`).
    - Task time blocking (`scheduleTaskBlock`) that creates calendar blocks and synchronizes `scheduled_start_at` and `scheduled_end_at` onto the linked task.
    - Event move and rescheduling (`moveEvent`).
  - Created `src/modules/calendar/utils.ts` for timezone-safe range calculation, month grid generation, and event color tokens.

- [x] **Task 6.3: REST API Endpoints (`/api/v1/calendar`)**
  - `GET /api/v1/calendar/events`: Filter events by date range (`from`, `to`), event type, project, and task.
  - `POST /api/v1/calendar/events`: Create new calendar event with embedded conflict advisory result.
  - `GET /api/v1/calendar/events/[id]`: Retrieve single event.
  - `PATCH /api/v1/calendar/events/[id]`: Update event properties.
  - `DELETE /api/v1/calendar/events/[id]`: Delete event and clean up linked task scheduled timestamps.
  - `POST /api/v1/calendar/events/[id]/move`: Reschedule event times and synchronize linked task.
  - `GET /api/v1/calendar/conflicts`: Live advisory conflict detection endpoint.
  - `POST /api/v1/calendar/schedule-task`: Specialized endpoint for one-click task time blocking.

- [x] **Task 6.4: UI Layer & Calendar Experience**
  - Created `src/components/calendar/CalendarHeader.tsx`: Date range navigation, active period label, Month/Week/Day/Agenda switcher, and global conflict counter.
  - Created `src/components/calendar/MonthView.tsx`: 42-day calendar grid, today indicator, event pills, day click-to-create, and conflict indicator icons.
  - Created `src/components/calendar/WeekView.tsx`: 7-day hourly grid (7 AM to 10 PM) with event positioning and overlap warning badges.
  - Created `src/components/calendar/DayView.tsx`: Focused single-day timeline with time slots and all-day header strip.
  - Created `src/components/calendar/AgendaView.tsx`: Responsive chronological agenda view with date headers and duration calculations.
  - Created `src/components/calendar/EventModal.tsx`: Create/Edit event dialog with live debounced conflict advisory warning banner.
  - Created `src/components/calendar/TimeBlockDrawer.tsx`: Unscheduled task drawer enabling one-click focus block scheduling.
  - Created `src/components/calendar/CalendarView.tsx`: Master view container.
  - Created `src/app/calendar/page.tsx`: Streaming Partial Prerendering page with Next.js 16 Suspense boundary.

- [x] **Task 6.5: Verification & Test Suite**
  - Schema unit tests: `src/modules/calendar/schemas.test.ts` (9 tests).
  - Service unit tests: `src/modules/calendar/calendar.service.test.ts` (5 tests).
  - API Route Handler integration tests: `src/app/api/v1/calendar/calendar.api.test.ts` (1 test).
  - Component tests: `src/components/calendar/CalendarView.test.tsx` (4 tests).
  - Full Vitest suite: **135/135 tests passing** across 34 test files.
  - ESLint: **0 errors, 0 warnings**.
  - TypeScript: **0 errors** (`tsc --noEmit`).
  - Next.js Production Build: **Exit code 0** (`next build`) with Partial Prerendering on `/calendar`.
