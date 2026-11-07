# Graph Report - personal-os  (2026-11-06)

## Corpus Check
- 251 files · ~110,818 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .ico 1)

## Summary
- 1096 nodes · 3997 edges · 41 communities (38 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 175 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- next.config.ts / nextConfig
- habits.api.test.ts / habits/[id]/archive/route.ts
- calendar/page.tsx / CalendarContent()
- journal/[id]/route.ts / DELETE()
- NoteEditor.tsx / MarkdownPreview()
- InboxListProps / InboxViewProps
- FocusViewProps / InMemoryFocusRepository
- search/route.ts / GET()
- TimeBlockDrawerProps / TodayAgendaProps
- react / TimeBlockDrawer.tsx
- @testing-library/react / vitest
- ProjectCreateDialogProps / project.repository.ts
- lucide-react / ActiveProjectsWidget.tsx
- @supabase/supabase-js / dashboard.service.ts
- EventModal.tsx / EventModal()
- package.json / devDependencies
- forgot-password/page.tsx / ForgotPasswordPage()
- JournalCalendarStrip.tsx / JournalCalendarStrip()
- InMemoryProjectRepository / .clear()
- tsconfig.json / compilerOptions
- IDayRepository / .upsertIntention()
- ProjectCard.tsx / priorityBadgeVariant
- dependencies / clsx@^2.1.1
- .constructor() / IProjectRepository
- app/page.tsx / DashboardContent()
- notes/schemas.ts / contentFormatSchema
- calendar/schemas.ts / calendarQuerySchema
- zod@^4.6.7 / zod
- ActiveProjectsWidgetProps / DashboardMetricsProps
- scripts / build
- day/schemas.ts / DateQueryInput
- projects/schemas.ts / CreateMilestoneSchema
- @supabase/ssr@^0.12.7 / @supabase/ssr
- @testing-library/jest-dom@^7.0.1 / @testing-library/jest-dom
- focus/schemas.ts / abandonFocusSessionSchema
- tasks/schemas.ts / CreateTaskSchema
- eslint.config.mjs / eslintConfig
- @vitejs/plugin-react@^6.2.1 / ref_node_path
- pnpm-workspace.yaml / allowBuilds

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 125 edges
2. `getAuthenticatedUser()` - 124 edges
3. `next` - 84 edges
4. `apiSuccess()` - 83 edges
5. `react` - 74 edges
6. `Button` - 63 edges
7. `apiUnauthorized()` - 58 edges
8. `apiBadRequest()` - 58 edges
9. `vitest` - 53 edges
10. `Task` - 51 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getAuthenticatedUser()`  [EXTRACTED]
  src/app/api/v1/auth/me/route.ts → src/lib/supabase/auth.ts
- `GET()` --calls--> `CalendarService`  [EXTRACTED]
  src/app/api/v1/calendar/conflicts/route.ts → src/modules/calendar/calendar.service.ts
- `POST()` --calls--> `CalendarService`  [EXTRACTED]
  src/app/api/v1/calendar/events/[id]/move/route.ts → src/modules/calendar/calendar.service.ts
- `GET()` --calls--> `CalendarService`  [EXTRACTED]
  src/app/api/v1/calendar/events/[id]/route.ts → src/modules/calendar/calendar.service.ts
- `PATCH()` --calls--> `CalendarService`  [EXTRACTED]
  src/app/api/v1/calendar/events/[id]/route.ts → src/modules/calendar/calendar.service.ts

## Import Cycles
- None detected.

## Communities (41 total, 3 thin omitted)

### Community 0 - "next.config.ts / nextConfig"
Cohesion: 0.07
Nodes (103): nextConfig, next, GET(), GET(), POST(), DELETE(), GET(), PATCH() (+95 more)

### Community 1 - "habits.api.test.ts / habits/[id]/archive/route.ts"
Cohesion: 0.06
Nodes (36): POST(), POST(), DELETE(), GET(), PATCH(), GET(), POST(), HabitsContent() (+28 more)

### Community 2 - "calendar/page.tsx / CalendarContent()"
Cohesion: 0.06
Nodes (45): CalendarContent(), CalendarPage(), metadata, AgendaView(), AgendaViewProps, CalendarHeader(), CalendarHeaderProps, CalendarView() (+37 more)

### Community 3 - "journal/[id]/route.ts / DELETE()"
Cohesion: 0.09
Nodes (27): DELETE(), GET(), PATCH(), GET(), POST(), GET(), JournalContent(), JournalPage() (+19 more)

### Community 4 - "NoteEditor.tsx / MarkdownPreview()"
Cohesion: 0.07
Nodes (20): MarkdownPreview(), NoteEditor(), NoteEditorProps, NoteCard(), NoteSidebar(), NoteSidebarProps, NotesView(), NotesViewProps (+12 more)

### Community 5 - "InboxListProps / InboxViewProps"
Cohesion: 0.09
Nodes (14): InboxListProps, InboxViewProps, globalInMemoryInboxRepo, InMemoryInboxRepository, SupabaseInboxRepository, CaptureSource, ConvertedEntityType, CreateInboxItemDTO (+6 more)

### Community 6 - "FocusViewProps / InMemoryFocusRepository"
Cohesion: 0.10
Nodes (12): FocusViewProps, InMemoryFocusRepository, SupabaseFocusRepository, ActiveFocusSession, CompleteFocusSessionDTO, EntryType, FocusSession, IFocusRepository (+4 more)

### Community 7 - "search/route.ts / GET()"
Cohesion: 0.13
Nodes (17): GET(), CommandPaletteProps, SearchQueryInput, SearchQuerySchema, SearchResultTypeEnum, getSearchRepository(), InMemorySearchRepository, ISearchRepository (+9 more)

### Community 8 - "TimeBlockDrawerProps / TodayAgendaProps"
Cohesion: 0.10
Nodes (11): TimeBlockDrawerProps, TodayAgendaProps, ProjectDetailViewProps, TaskItemProps, TaskListProps, InMemoryTaskRepository, SupabaseTaskRepository, TaskService (+3 more)

### Community 9 - "react / TimeBlockDrawer.tsx"
Cohesion: 0.17
Nodes (19): react, moodOptions, ProjectDetailView(), TaskCreateDialog(), TaskCreateDialogProps, TaskEmptyState(), TaskEmptyStateProps, StatusFilterOption (+11 more)

### Community 10 - "@testing-library/react / vitest"
Cohesion: 0.11
Nodes (17): @testing-library/react, vitest, inter, metadata, RootLayout(), AppShell(), AppShellProps, Header() (+9 more)

### Community 11 - "ProjectCreateDialogProps / project.repository.ts"
Cohesion: 0.17
Nodes (8): ProjectCreateDialogProps, getInMemoryProjectRepository(), globalInMemoryProjectRepo, CreateProjectDTO, Project, ProjectFilters, ProjectStats, UpdateProjectDTO

### Community 12 - "lucide-react / ActiveProjectsWidget.tsx"
Cohesion: 0.17
Nodes (13): lucide-react, ActiveProjectsWidget(), DashboardHeader(), DashboardHeaderProps, DashboardMetrics(), DashboardView(), DynamicScenery(), DynamicSceneryProps (+5 more)

### Community 13 - "@supabase/supabase-js / dashboard.service.ts"
Cohesion: 0.18
Nodes (12): @supabase/supabase-js, createDashboardService(), DashboardService, getDayRepository(), getInMemoryDayRepository(), globalInMemoryDayRepo, createDayService(), DayService (+4 more)

### Community 14 - "EventModal.tsx / EventModal()"
Cohesion: 0.21
Nodes (14): EventModal(), HabitCard(), colorOptions, HabitModal(), HabitModalProps, HabitsView(), InboxList(), InboxView() (+6 more)

### Community 15 - "package.json / devDependencies"
Cohesion: 0.12
Nodes (21): devDependencies, jsdom@^31.0.0, tailwindcss@^4, @tailwindcss/turbopack@^4, @testing-library/react@^16.3.3, @types/node@^20, @types/react@^19, @types/react-dom@^19 (+13 more)

### Community 16 - "forgot-password/page.tsx / ForgotPasswordPage()"
Cohesion: 0.24
Nodes (13): ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), SignupPage(), checkWorkspace(), AppOrb(), AppOrbProps, emptySubscribe() (+5 more)

### Community 17 - "JournalCalendarStrip.tsx / JournalCalendarStrip()"
Cohesion: 0.19
Nodes (14): JournalCalendarStrip(), JournalCalendarStripProps, JournalEditor(), JournalHistory(), JournalView(), mockEntry, Badge(), BadgeProps (+6 more)

### Community 18 - "InMemoryProjectRepository / .clear()"
Cohesion: 0.15
Nodes (4): InMemoryProjectRepository, SupabaseProjectRepository, CreateMilestoneDTO, ProjectMilestone

### Community 19 - "tsconfig.json / compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "IDayRepository / .upsertIntention()"
Cohesion: 0.20
Nodes (4): IDayRepository, InMemoryDayRepository, SupabaseDayRepository, DailyPlan

### Community 21 - "ProjectCard.tsx / priorityBadgeVariant"
Cohesion: 0.24
Nodes (10): priorityBadgeVariant, ProjectCard(), statusBadgeVariant, ProjectCreateDialog(), ProjectFilterBar(), ProjectFilterBarProps, ProjectStatusFilterOption, ProjectList() (+2 more)

### Community 22 - "dependencies / clsx@^2.1.1"
Cohesion: 0.13
Nodes (15): dependencies, clsx@^2.1.1, cmdk@^1.1.1, lucide-react@^1.69.0, next@16.4.5, react@19.3.0, react-dom@19.3.0, @supabase/supabase-js@^2.119.0 (+7 more)

### Community 23 - ".constructor() / IProjectRepository"
Cohesion: 0.24
Nodes (3): IProjectRepository, ProjectService, ITaskRepository

### Community 24 - "app/page.tsx / DashboardContent()"
Cohesion: 0.24
Nodes (9): DashboardContent(), HomePage(), metadata, metadata, ProjectsPage(), metadata, TasksPage(), PageShell() (+1 more)

### Community 26 - "notes/schemas.ts / contentFormatSchema"
Cohesion: 0.23
Nodes (10): contentFormatSchema, CreateNoteInput, CreateNoteLinkInput, createNoteLinkSchema, createNoteSchema, linkTypeSchema, noteQuerySchema, noteTypeSchema (+2 more)

### Community 27 - "calendar/schemas.ts / calendarQuerySchema"
Cohesion: 0.27
Nodes (9): calendarQuerySchema, conflictQuerySchema, CreateCalendarEventInput, createCalendarEventSchema, eventTypeSchema, MoveCalendarEventInput, moveCalendarEventSchema, UpdateCalendarEventInput (+1 more)

### Community 28 - "zod@^4.6.7 / zod"
Cohesion: 0.28
Nodes (7): zod@^4.6.7, zod, captureTypeSchema, createInboxItemSchema, inboxStatusSchema, processInboxItemSchema, updateInboxItemSchema

### Community 29 - "ActiveProjectsWidgetProps / DashboardMetricsProps"
Cohesion: 0.25
Nodes (8): ActiveProjectsWidgetProps, DashboardMetricsProps, DashboardViewProps, ProjectCardProps, ProjectListProps, DashboardMetrics, DashboardOverviewDTO, ProjectWithStats

### Community 30 - "scripts / build"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:watch, typecheck

### Community 31 - "day/schemas.ts / DateQueryInput"
Cohesion: 0.36
Nodes (6): DateQueryInput, dateQuerySchema, UpdateIntentionInput, updateIntentionSchema, UpdateShutdownNotesInput, updateShutdownNotesSchema

### Community 32 - "projects/schemas.ts / CreateMilestoneSchema"
Cohesion: 0.39
Nodes (6): CreateMilestoneSchema, CreateProjectSchema, ProjectPriorityEnum, ProjectQuerySchema, ProjectStatusEnum, UpdateProjectSchema

### Community 33 - "@supabase/ssr@^0.12.7 / @supabase/ssr"
Cohesion: 0.38
Nodes (5): @supabase/ssr@^0.12.7, @supabase/ssr, updateSession(), config, middleware()

### Community 34 - "@testing-library/jest-dom@^7.0.1 / @testing-library/jest-dom"
Cohesion: 0.29
Nodes (3): @testing-library/jest-dom@^7.0.1, @testing-library/jest-dom, ResizeObserver

### Community 35 - "focus/schemas.ts / abandonFocusSessionSchema"
Cohesion: 0.43
Nodes (5): abandonFocusSessionSchema, completeFocusSessionSchema, sessionModeSchema, sessionStatusSchema, startFocusSessionSchema

### Community 36 - "tasks/schemas.ts / CreateTaskSchema"
Cohesion: 0.43
Nodes (5): CreateTaskSchema, TaskPriorityEnum, TaskQuerySchema, TaskStatusEnum, UpdateTaskSchema

### Community 37 - "eslint.config.mjs / eslintConfig"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.5, eslint, eslint-config-next

### Community 39 - "pnpm-workspace.yaml / allowBuilds"
Cohesion: 0.50
Nodes (3): allowBuilds, sharp, unrs-resolver

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 33`, `Community 7`, `Community 9`, `Community 10`, `Community 12`, `Community 15`, `Community 16`, `Community 21`, `Community 22`, `Community 24`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06929144566843465 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Community 9` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 7`, `Community 10`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 21`, `Community 22`, `Community 24`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06030855539971949 - nodes in this community are weakly interconnected._
- **Why does `createClient()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 7`, `Community 24`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0630673674151935 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08509615384615385 - nodes in this community are weakly interconnected._