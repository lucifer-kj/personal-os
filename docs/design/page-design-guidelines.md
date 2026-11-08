# Personal OS — Page Design Guidelines & Reference Architecture

## 1. Application Shell Structure

```
+-------------------------------------------------------------------------------------------------+
|                                           HEADER                                                |
| [Breadcrumb: Personal OS / Page]      [Search / ask anything... ⌘K]  [+ New] [Theme] [Avatar A] |
+----------------------------------+--------------------------------------------------------------+
| SIDEBAR                          | MAIN WORKSPACE VIEWPORT                                      |
|                                  |                                                              |
| [Logo: Personal OS]              | (Dashboard, Notes, The Radar, Tasks, Projects, etc.)         |
|                                  |                                                              |
| * My Day                         |                                                              |
| * Tasks (12)                     |                                                              |
| * Projects                       |                                                              |
| * Notes                          |                                                              |
| * The Radar                      |                                                              |
| * Calendar                       |                                                              |
| * Focus                          |                                                              |
|                                  |                                                              |
| MORE                             |                                                              |
| * Habits                         |                                                              |
| * Journal                        |                                                              |
|                                  |                                                              |
| ⚙ Settings                       |                                                              |
| 👤 Arif (Personal Workspace)     |                                                              |
+----------------------------------+--------------------------------------------------------------+
```

---

## 2. Page Blueprint 1: Dashboard (`/`)
*Reference Asset: `media_1794100054369_539f0aaa.jpg`*

### Structure & Layout Rhythm
1. **Panoramic Hero Card (`DashboardHeader.tsx`)**:
   - `rounded-3xl border border-[var(--border)] overflow-hidden relative min-h-[280px]`
   - High-res dynamic landscape background from `public/scenery/`.
   - Top meta bar: Date pill (`SUN, NOV 8 • 24°C Kolkata`) and discreet scenery override toggle.
   - Editorial Serif greeting: `Good morning, Arif.` + `A focused day builds meaningful progress.`
   - Primary action buttons:
     - `Start Deep Work (45m)`: `rounded-full bg-[#E05B27] text-white px-5 h-10`
     - `Plan My Day`: `rounded-full border border-white/15 bg-white/10 dark:bg-[#1C1917]/80 text-[var(--foreground)] px-5 h-10`
   - Frosted Intention Glass Card:
     - Header: `DAILY FOCUS INTENTION` with amber icon + `Set Intention` button.
     - Body: Italicized user daily intention quote.
2. **Four-Card Metric Row**:
   - 4 equal-width responsive columns (`grid grid-cols-2 lg:grid-cols-4 gap-4`).
   - Cards have distinct colored 2px accent underline bars:
     - `Focus Time` (`3h 20m` + `+12%` pill) -> Orange accent bar (`#E05B27`).
     - `Daily Tasks` (`0 / 1` or `7 / 12`) -> Green accent bar (`#34945A`).
     - `Active Projects` (`3`) -> Amber accent bar (`#D98218`).
     - `Targets` (`68%`) -> Off-white/cream accent bar (`#E5DDD3`).
3. **Focus & Timer Row**:
   - 2 equal-height cards (`grid grid-cols-1 lg:grid-cols-12 gap-6`).
   - Left (7 cols): `Current Focus` card with title, 3 tag badges (`Token grid`, `Layout system`, `Interaction states`), and progress bar.
   - Right (5 cols): `Focus Timer` card with circular SVG countdown timer (`45:00`), play button, `+5m` button, and target status.
4. **Flow & Projects Row**:
   - 2 equal-height cards (`grid grid-cols-1 lg:grid-cols-12 gap-6`).
   - Left (7 cols): `Today's Flow` card with timeline view, priority badges, and `View all tasks →`.
   - Right (5 cols): `Active Projects` card with multi-project progress bars and `Projects →`.

---

## 3. Page Blueprint 2: Notes (`/notes`)
*Reference Asset: `media_1794100054580_8ecbfe8c.jpg`*

### Structure & Layout Rhythm
1. **Header Bar**:
   - Title: `Notes` (Editorial Serif, 32px), Subtitle: `Capture ideas, synthesize reading, and build knowledge.`
   - Action: `+ New Note` (white rounded-full pill button).
2. **Two-Column Layout**:
   - **Left Column (~340px)**:
     - Pill Filter Tabs: `All (count)`, `Pinned`, `Archive` with clean active underline indicator.
     - Note Cards List:
       - Selected card: `border border-[#d25828]/50 bg-[#1e1916]` with warm amber title highlight.
       - Snippet preview text (2 lines).
       - Footer: formatted date and `#tag` pills.
   - **Right Column (Editor / Reader View)**:
     - Status Header: `● Saved` (green status dot) on the left; format tools on the right (`Edit`, `Preview`, `Split`, `...`, Delete icon).
     - Note Title: `font-serif text-2xl sm:text-3xl font-bold text-[var(--foreground)]`.
     - Metadata Row:
       - `Type: Concept ▾` dropdown pill.
       - `Link Task ▾` dropdown pill.
       - Active tag chips (`#radar ✕`, `#tech ✕`).
       - `+ Add tag` button.
     - Source Callout Box:
       - Left accent border: `border-l-2 border-[#E05B27] bg-[#161311] p-3 rounded-r-xl`.
       - Content: `Source: <source_name>`, `Published: <date>`.
     - Section: `Executive Summary` (font-serif heading) with calm readable prose or placeholder.
     - Section: `Comments` with interactive comment input field.

---

## 4. Page Blueprint 3: The Radar (`/radar`)
*Reference Asset: `media_1794100054707_2960b65a.jpg`*

### Structure & Layout Rhythm
1. **Header & Action Suite**:
   - Title: `The Radar` (Editorial Serif, 32px), Subtitle: `Curated high-signal RSS and Atom feeds for learning, ideas, and opportunities.`
   - Top Right Action Cluster:
     - `Auto Clean`: `rounded-full border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--muted-foreground)]`
     - `Sync Feeds`: `rounded-full border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--foreground)]`
     - `+ Add Feed`: `rounded-full bg-white dark:bg-[#F4EFEA] text-[#12100E] px-4 py-1.5 text-xs font-semibold`
2. **Global Category Filter Bar**:
   - Pill tabs: `All`, `Unread (count)`, `Starred`, `Tech`, `Business`, `Design`, `AI`.
3. **Three-Column Signal Deck**:
   - **Left Column (Feeds List ~260px)**:
     - Header: `Feeds (count)`.
     - `All Feeds` row with total signal count badge.
     - Feed rows with icon, publication name, and unread count badge.
   - **Middle Column (Signal Stream ~380px)**:
     - Search input: `Search articles...` with filter icon.
     - Article cards: Feed name in terracotta accent, star toggle, article headline, publication date, unread indicator dot.
   - **Right Column (Reading Pane)**:
     - Category tag (e.g. `TECH` in indigo/blue badge).
     - Action suite: Star icon, Open original link icon, `Mark as Read` button.
     - Headline: Large Editorial Serif typography.
     - Metadata line: Author & timestamp.
     - Embedded media/hero thumbnail with soft rounded corners.
     - Full article body with readable line height and typography.
     - Signal Synthesis & Promotion Deck: personal takeaways textarea + `Promote to Note` and `Draft Social Post` buttons.
