# Personal OS — Current Sprint (Sprint 7)

## Sprint Focus: M7 — Notes & Knowledge Base
- **Objective:** Implement complete end-to-end Notes and Knowledge Base module with database migration (`0007_notes.sql`), Zod boundary schemas, repository layer (InMemory and Supabase), domain service with wiki-link parsing (`[[Title]]`), note-to-note linking, tag indexing, REST Route Handlers (`/api/v1/notes/*`), rich markdown editor with preview/split modes, tag filtering, pinned notes, and dedicated `/notes` workstation page with Partial Prerendering.
- **Status:** M7 Completed & Verified. Next Focus: M8 (Habits & Journal).

## Sprint 7 Completed Deliverables

- [x] **Task 7.1: Database Schema & Migration**
  - Created `db/migrations/0007_notes.sql` defining `notes` and `note_links` tables conforming to Supabase Database Spec.
  - Added columns: `user_id`, `title`, `content`, `content_format` (`markdown`, `plain_text`), `note_type` (`general`, `meeting`, `project_plan`, `reference`, `scratchpad`), `project_id`, `task_id`, `tags` (`text[]`), `is_pinned`, `is_archived`.
  - Added GIN index on `tags` array for ultra-fast tag filtering and composite indexes on `(user_id, is_pinned, updated_at DESC)`.
  - Configured `note_links` table with `source_note_id`, `target_note_id`, `link_type`, and self-referencing check constraint (`source_note_id != target_note_id`).
  - Configured PostgreSQL Row-Level Security (RLS) with owner-isolated policies for SELECT, INSERT, UPDATE, DELETE across both tables.

- [x] **Task 7.2: Notes Domain Module & Service Layer**
  - Created `src/modules/notes/types.ts` and `src/modules/notes/schemas.ts` with strict Zod boundary validation.
  - Created `src/modules/notes/note.repository.ts` with in-memory and Supabase repository implementations (`InMemoryNoteRepository`, `SupabaseNoteRepository`, `getNoteRepository`).
  - Created `src/modules/notes/note.service.ts`:
    - Full CRUD for notes with tag extraction and sanitization.
    - Wiki-link extraction (`[[Title]]` pattern) and automatic note linking.
    - Explicit bidirectional and unidirectional note-to-note links.
    - Pinning and archiving toggles.
    - Distinct tag taxonomy indexing.

- [x] **Task 7.3: REST API Endpoints (`/api/v1/notes`)**
  - `GET /api/v1/notes`: Filter notes by `tag`, `project_id`, `task_id`, `note_type`, `is_pinned`, `is_archived`, and text search.
  - `POST /api/v1/notes`: Create new note with automatic wiki-link resolution.
  - `GET /api/v1/notes/[id]`: Retrieve note along with forward links and backlinks.
  - `PATCH /api/v1/notes/[id]`: Update note title, content, tags, type, or associations.
  - `DELETE /api/v1/notes/[id]`: Delete note and cascade remove note links.
  - `POST /api/v1/notes/[id]/pin`: Toggle note pinned status.
  - `POST /api/v1/notes/[id]/archive`: Toggle note archived status.
  - `GET /api/v1/notes/[id]/links`: Retrieve forward links and backlinks for a note.
  - `POST /api/v1/notes/[id]/links`: Manually create a note-to-note link.
  - `DELETE /api/v1/notes/[id]/links`: Remove a note link.
  - `GET /api/v1/notes/tags`: Retrieve all distinct tags across user's notes.

- [x] **Task 7.4: UI Layer & Knowledge Experience**
  - Created `src/components/notes/NoteSidebar.tsx`: Search input, All / Pinned / Archived filter tabs, horizontal tag pills, pinned notes section, and active note list with date badges and tag chips.
  - Created `src/components/notes/NoteEditor.tsx`:
    - Responsive header with autosave status indicator (Unsaved changes / Saving / Saved).
    - Edit, Preview, and Side-by-Side Split viewing modes.
    - Lightweight markdown preview renderer supporting headers, task checkboxes, lists, code blocks, blockquotes, bold/italic, and `[[wiki-links]]`.
    - Note type selector, project association, task association, tag manager with inline add/remove, and linked notes drawer showing forward links & backlinks.
  - Created `src/components/notes/NotesView.tsx`: Split workstation coordinating sidebar and editor with seamless selection and quick creation.
  - Created `src/app/notes/page.tsx`: Streaming Partial Prerendering page shell with Next.js 16 Suspense boundary.

- [x] **Task 7.5: Verification & Test Suite**
  - Schema unit tests: `src/modules/notes/schemas.test.ts` (7 tests).
  - Service unit tests: `src/modules/notes/note.service.test.ts` (5 tests).
  - API Route Handler integration tests: `src/app/api/v1/notes/notes.api.test.ts` (1 test).
  - Component tests: `src/components/notes/NotesView.test.tsx` (4 tests).
  - Full Vitest suite: **152/152 tests passing** across 38 test files.
  - ESLint: **0 errors, 0 warnings**.
  - TypeScript: **0 errors** (`tsc --noEmit`).
  - Next.js Production Build: **Exit code 0** (`next build`) with Partial Prerendering on `/notes`.
