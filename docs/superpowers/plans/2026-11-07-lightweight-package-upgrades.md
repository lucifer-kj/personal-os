# Implementation Plan: Lightweight Package Superpowers & Scenery Previews

**Goal:** Upgrade Personal OS with curated, featherweight (< 15 KB each) open-source libraries to eliminate boilerplate code, replace fragile handwritten parsers, elevate the visual and tactile feel (scenery time preview, celebratory feedback), and lay the foundation for The Radar (RSS feeds).

---

## 1. Selected Package Suite & Impact Analysis

| Package | Gzipped Size | Purpose & Where It Plugs In | Replaces / Enables |
| :--- | :--- | :--- | :--- |
| **`sonner`** | **~3.5 KB** | Mounted in root [`AppShell`](file:///c:/Users/USER/Documents/Builds/personal-os/src/components/layout/AppShell.tsx). Used in Studio, Notes, Ingest, Habits, Focus. | Replaces manual `errorMsg`/`successMsg` and `setTimeout` state in 6+ components. Enables stacked notifications with undo actions. |
| **`react-markdown` + `remark-gfm`** | **~12 KB** | Notes workstation [`NoteEditor.tsx`](file:///c:/Users/USER/Documents/Builds/personal-os/src/components/notes/NoteEditor.tsx). | Replaces fragile line-by-line regex parser (`content.split("\n")`). Unlocks tables, strikethrough, bold/italics, code blocks, task checklists. |
| **`canvas-confetti`** + `@types/canvas-confetti` | **~3 KB** | Dashboard, Tasks, Habits, Focus sessions. | Triggers celebratory tactile burst when completing all daily agenda tasks, logging habit streaks, or finishing a 25-min Pomodoro. |
| **`date-fns`** | **~1-2 KB** (tree-shaken) | Agenda, Studio, Natural Syntax tokenizer, Calendar. | Provides clean `formatDistanceToNowStrict`, `isToday`, `format`, replacing verbose manual Date math. |
| **`rss-parser`** | **~8 KB** (server-only) | `/api/v1/radar` endpoint & RSS reader. | Robust parser for RSS 2.0, Atom, and RDF feeds (Substack, blogs, news) for Phase 3: The Radar. |

---

## 2. Interactive Feature: Dashboard Day Change & Scenery Preview

### Concept & Mechanics
Currently, [`DynamicScenery.tsx`](file:///c:/Users/USER/Documents/Builds/personal-os/src/components/dashboard/DynamicScenery.tsx) automatically switches scenery SVGs based on client clock hour (`dawn` 5-11 AM, `day` 11 AM-5 PM, `dusk` 5-9 PM, `night` 9 PM-5 AM).

**Enhancement:**
1. **Interactive Scenery Control Pill in Dashboard Header**:
   - Displays current time-of-day badge (`Dawn`, `Day`, `Dusk`, `Night`) with an "Auto / Preview" toggle.
   - When clicked, opens a subtle, elegant 4-stage selector allowing the user to preview how the dashboard and ambient backdrop look at dawn, midday, sunset, and midnight.
2. **Smooth Cross-Dissolve Transition**:
   - Double-buffered SVG layers with CSS `transition: opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)` so the scenery cross-fades rather than popping.
3. **Orb State Synchronization**:
   - The [`AppOrb`](file:///c:/Users/USER/Documents/Builds/personal-os/src/components/brand/AppOrb.tsx) dynamically synchronizes its breathing color spectrum to the previewed scenery (dawn amber, midday cerulean, dusk magenta, midnight obsidian).

---

## 3. Phased Execution Tasks

### Task 1: Install Dependencies
- Run `pnpm add sonner react-markdown remark-gfm canvas-confetti date-fns rss-parser`.
- Run `pnpm add -D @types/canvas-confetti`.
- Verify zero peer dependency conflicts with React 19 and Next.js 16.

### Task 2: Mount Root Toaster & Replace Alert Boilerplate
- Mount `<Toaster position="bottom-right" richColors />` inside `src/components/layout/AppShell.tsx`.
- Refactor `SocialStudioView.tsx`, `QuickCaptureModal.tsx`, and `NoteEditor.tsx` to replace `errorMsg` / `successMsg` with `toast.success`, `toast.error`.

### Task 3: Upgrade Notes Markdown Rendering
- Replace line-by-line regex in `src/components/notes/NoteEditor.tsx` with `<ReactMarkdown remarkPlugins={[remarkGfm]}>`.
- Add customized renderers for wiki-links `[[Note Title]]`, task checklists, and code snippets.

### Task 4: Interactive Dashboard Scenery & Day Change Preview
- Upgrade `src/components/dashboard/DynamicScenery.tsx` with smooth cross-fading layers.
- Add an interactive Time-of-Day preview pill selector in `src/components/dashboard/DashboardHeader.tsx` allowing scrubbing between Dawn, Day, Dusk, and Night.
- Synchronize `AppOrb` color states to the active scenery preview.

### Task 5: Celebratory Micro-Interactions (Canvas Confetti)
- Create `src/lib/ui/confetti.ts` wrapping `canvas-confetti` with warm editorial colors.
- Trigger on 100% daily tasks complete, habit check-in streak, and focus session completion.

### Task 6: Radar RSS Feed Engine Foundation (`rss-parser`)
- Create `src/modules/radar/rss.service.ts` using `rss-parser` to validate and parse feeds.
- Write unit tests for feed normalization.

---

## 4. Verification & Health Protocol
1. `pnpm typecheck` — 0 TypeScript errors.
2. `pnpm test` — Ensure all existing 237 tests pass + new tests for upgraded components.
3. `pnpm build` — Verify static & streaming routes build cleanly with Turbopack.
4. Dev server check on `http://localhost:3000`.
