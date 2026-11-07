# Graph Report - personal-os  (2026-11-06)

## Corpus Check
- 241 files · ~106,931 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .ico 1)

## Summary
- 1048 nodes · 3872 edges · 34 communities (32 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 171 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- next.config.ts / nextConfig
- @supabase/supabase-js / notes/page.tsx
- dashboard.api.test.ts / NotesContent()
- journal/[id]/route.ts / DELETE()
- HabitCardProps / HabitModalProps
- inbox/page.tsx / InboxContent()
- NoteEditor.tsx / MarkdownPreview()
- AgendaViewProps / DayViewProps
- focus/page.tsx / FocusContent()
- calendar/page.tsx / CalendarContent()
- HabitCard.tsx / HabitCard()
- react / @testing-library/react
- forgot-password/page.tsx / ForgotPasswordPage()
- tsconfig.json / compilerOptions
- src_app_globals / layout.tsx
- devDependencies / jsdom@^31.0.0
- lucide-react / EventModal.tsx
- TaskEmptyState.tsx / TaskEmptyState()
- dependencies / clsx@^2.1.1
- notes/schemas.ts / contentFormatSchema
- package.json / tailwindcss@^4
- calendar/schemas.ts / calendarQuerySchema
- zod@^4.6.7 / zod
- DashboardHeader.tsx / DashboardHeader()
- scripts / build
- day/schemas.ts / DateQueryInput
- projects/schemas.ts / CreateMilestoneSchema
- @supabase/ssr@^0.12.7 / @supabase/ssr
- habits/schemas.ts / CreateHabitSchema
- tasks/schemas.ts / CreateTaskSchema
- eslint.config.mjs / eslintConfig
- @vitejs/plugin-react@^6.2.1 / ref_node_path
- pnpm-workspace.yaml / allowBuilds

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 123 edges
2. `getAuthenticatedUser()` - 122 edges
3. `apiSuccess()` - 83 edges
4. `next` - 81 edges
5. `react` - 72 edges
6. `Button` - 63 edges
7. `apiUnauthorized()` - 58 edges
8. `apiBadRequest()` - 58 edges
9. `Task` - 51 edges
10. `vitest` - 49 edges

## Surprising Connections (you probably didn't know these)
- `CardFooter` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts
- `GET()` --calls--> `getAuthenticatedUser()`  [EXTRACTED]
  src/app/api/v1/auth/me/route.ts → src/lib/supabase/auth.ts
- `GET()` --calls--> `CalendarService`  [EXTRACTED]
  src/app/api/v1/calendar/conflicts/route.ts → src/modules/calendar/calendar.service.ts
- `POST()` --calls--> `CalendarService`  [EXTRACTED]
  src/app/api/v1/calendar/events/[id]/move/route.ts → src/modules/calendar/calendar.service.ts
- `GET()` --calls--> `CalendarService`  [EXTRACTED]
  src/app/api/v1/calendar/events/[id]/route.ts → src/modules/calendar/calendar.service.ts

## Import Cycles
- None detected.

## Communities (34 total, 2 thin omitted)

### Community 0 - "next.config.ts / nextConfig"
Cohesion: 0.07
Nodes (107): nextConfig, next, GET(), GET(), POST(), DELETE(), GET(), PATCH() (+99 more)

### Community 1 - "@supabase/supabase-js / notes/page.tsx"
Cohesion: 0.05
Nodes (35): @supabase/supabase-js, metadata, CalendarViewProps, EventModalProps, TimeBlockDrawerProps, DashboardMetricsProps, DashboardViewProps, TodayAgendaProps (+27 more)

### Community 2 - "dashboard.api.test.ts / NotesContent()"
Cohesion: 0.06
Nodes (32): NotesContent(), NotesPage(), ActiveProjectsWidgetProps, NotesViewProps, priorityBadgeVariant, ProjectCard(), ProjectCardProps, statusBadgeVariant (+24 more)

### Community 3 - "journal/[id]/route.ts / DELETE()"
Cohesion: 0.08
Nodes (31): DELETE(), GET(), PATCH(), GET(), POST(), GET(), JournalContent(), metadata (+23 more)

### Community 4 - "HabitCardProps / HabitModalProps"
Cohesion: 0.07
Nodes (21): HabitCardProps, HabitModalProps, HabitsViewProps, mockHabits, mockStats, getLocalDateIso(), getPastLocalDateIso(), globalInMemoryHabitRepo (+13 more)

### Community 5 - "inbox/page.tsx / InboxContent()"
Cohesion: 0.06
Nodes (29): InboxContent(), InboxPage(), metadata, JournalPage(), DashboardContent(), HomePage(), metadata, metadata (+21 more)

### Community 6 - "NoteEditor.tsx / MarkdownPreview()"
Cohesion: 0.07
Nodes (20): MarkdownPreview(), NoteEditor(), NoteEditorProps, NoteCard(), NoteSidebar(), NoteSidebarProps, NotesView(), globalInMemoryNoteRepo (+12 more)

### Community 7 - "AgendaViewProps / DayViewProps"
Cohesion: 0.09
Nodes (16): AgendaViewProps, DayViewProps, MonthViewProps, WeekViewProps, globalInMemoryCalendarRepo, InMemoryCalendarRepository, SupabaseCalendarRepository, CalendarService (+8 more)

### Community 8 - "focus/page.tsx / FocusContent()"
Cohesion: 0.09
Nodes (17): FocusContent(), FocusPage(), metadata, FocusViewProps, globalInMemoryFocusRepo, InMemoryFocusRepository, SupabaseFocusRepository, FocusService (+9 more)

### Community 9 - "calendar/page.tsx / CalendarContent()"
Cohesion: 0.19
Nodes (26): CalendarContent(), CalendarPage(), metadata, AgendaView(), CalendarHeader(), CalendarHeaderProps, CalendarView(), DayView() (+18 more)

### Community 10 - "HabitCard.tsx / HabitCard()"
Cohesion: 0.17
Nodes (19): HabitCard(), colorOptions, HabitModal(), HabitsView(), JournalCalendarStrip(), JournalCalendarStripProps, NavItem, primaryNavItems (+11 more)

### Community 11 - "react / @testing-library/react"
Cohesion: 0.16
Nodes (14): react, @testing-library/react, vitest, ActiveProjectsWidget(), DashboardMetrics(), DashboardView(), QuickCaptureCard(), QuickCaptureCardProps (+6 more)

### Community 12 - "forgot-password/page.tsx / ForgotPasswordPage()"
Cohesion: 0.24
Nodes (13): ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), SignupPage(), checkWorkspace(), AppOrb(), AppOrbProps, emptySubscribe() (+5 more)

### Community 13 - "tsconfig.json / compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 14 - "src_app_globals / layout.tsx"
Cohesion: 0.19
Nodes (10): inter, metadata, RootLayout(), AppShell(), AppShellProps, Header(), HeaderProps, routeTitleMap (+2 more)

### Community 15 - "devDependencies / jsdom@^31.0.0"
Cohesion: 0.14
Nodes (13): devDependencies, jsdom@^31.0.0, @tailwindcss/turbopack@^4, @testing-library/jest-dom@^7.0.1, @testing-library/react@^16.3.3, @types/node@^20, @types/react-dom@^19, vitest@^5.1.0 (+5 more)

### Community 16 - "lucide-react / EventModal.tsx"
Cohesion: 0.32
Nodes (9): lucide-react, EventModal(), TimeBlockDrawer(), InboxList(), InboxView(), QuickCaptureModal(), QuickCaptureModalProps, Button (+1 more)

### Community 17 - "TaskEmptyState.tsx / TaskEmptyState()"
Cohesion: 0.26
Nodes (9): TaskEmptyState(), TaskEmptyStateProps, StatusFilterOption, TaskFilterBar(), TaskFilterBarProps, TaskList(), TaskSkeleton(), TaskPriority (+1 more)

### Community 18 - "dependencies / clsx@^2.1.1"
Cohesion: 0.15
Nodes (13): dependencies, clsx@^2.1.1, lucide-react@^1.69.0, next@16.4.5, react@19.3.0, react-dom@19.3.0, @supabase/supabase-js@^2.119.0, tailwind-merge@^3.7.0 (+5 more)

### Community 20 - "notes/schemas.ts / contentFormatSchema"
Cohesion: 0.23
Nodes (10): contentFormatSchema, CreateNoteInput, CreateNoteLinkInput, createNoteLinkSchema, createNoteSchema, linkTypeSchema, noteQuerySchema, noteTypeSchema (+2 more)

### Community 21 - "package.json / tailwindcss@^4"
Cohesion: 0.18
Nodes (10): tailwindcss@^4, @types/react@^19, typescript@^5, name, packageManager, private, version, tailwindcss (+2 more)

### Community 22 - "calendar/schemas.ts / calendarQuerySchema"
Cohesion: 0.27
Nodes (9): calendarQuerySchema, conflictQuerySchema, CreateCalendarEventInput, createCalendarEventSchema, eventTypeSchema, MoveCalendarEventInput, moveCalendarEventSchema, UpdateCalendarEventInput (+1 more)

### Community 23 - "zod@^4.6.7 / zod"
Cohesion: 0.28
Nodes (7): zod@^4.6.7, zod, captureTypeSchema, createInboxItemSchema, inboxStatusSchema, processInboxItemSchema, updateInboxItemSchema

### Community 24 - "DashboardHeader.tsx / DashboardHeader()"
Cohesion: 0.33
Nodes (6): DashboardHeader(), DashboardHeaderProps, DynamicScenery(), DynamicSceneryProps, getTimeOfDay(), TimeOfDay

### Community 25 - "scripts / build"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:watch, typecheck

### Community 26 - "day/schemas.ts / DateQueryInput"
Cohesion: 0.36
Nodes (6): DateQueryInput, dateQuerySchema, UpdateIntentionInput, updateIntentionSchema, UpdateShutdownNotesInput, updateShutdownNotesSchema

### Community 27 - "projects/schemas.ts / CreateMilestoneSchema"
Cohesion: 0.39
Nodes (6): CreateMilestoneSchema, CreateProjectSchema, ProjectPriorityEnum, ProjectQuerySchema, ProjectStatusEnum, UpdateProjectSchema

### Community 28 - "@supabase/ssr@^0.12.7 / @supabase/ssr"
Cohesion: 0.38
Nodes (5): @supabase/ssr@^0.12.7, @supabase/ssr, updateSession(), config, middleware()

### Community 29 - "habits/schemas.ts / CreateHabitSchema"
Cohesion: 0.48
Nodes (5): CreateHabitSchema, HabitFilterSchema, HabitFrequencySchema, LogHabitSchema, UpdateHabitSchema

### Community 30 - "tasks/schemas.ts / CreateTaskSchema"
Cohesion: 0.43
Nodes (5): CreateTaskSchema, TaskPriorityEnum, TaskQuerySchema, TaskStatusEnum, UpdateTaskSchema

### Community 31 - "eslint.config.mjs / eslintConfig"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.5, eslint, eslint-config-next

### Community 33 - "pnpm-workspace.yaml / allowBuilds"
Cohesion: 0.50
Nodes (3): allowBuilds, sharp, unrs-resolver

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 18`, `Community 21`, `Community 24`, `Community 28`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0688622754491018 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Community 11` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 21`, `Community 24`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.050156739811912224 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Community 11` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 12`, `Community 15`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 29`, `Community 30`, `Community 32`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.060534822215692036 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.0776255707762557 - nodes in this community are weakly interconnected._