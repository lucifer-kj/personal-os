# Graph Report - personal-os  (2026-11-06)

## Corpus Check
- 275 files · ~120,838 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .ico 1)

## Summary
- 1204 nodes · 4360 edges · 47 communities (43 shown, 4 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 181 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- next.config.ts / nextConfig
- habits.api.test.ts / habits/[id]/archive/route.ts
- journal/[id]/route.ts / DELETE()
- NoteEditor.tsx / MarkdownPreview()
- studio/page.tsx / metadata
- CalendarViewProps / EventModal.tsx
- calendar/page.tsx / CalendarContent()
- FocusViewProps / InMemoryFocusRepository
- search/route.ts / GET()
- InboxListProps / InboxViewProps
- calendar.repository.ts / getInMemoryCalendarRepository()
- react / ProjectDetailView.tsx
- QuickIngestBar.tsx / QuickIngestBar()
- ActiveProjectsWidget.tsx / ActiveProjectsWidgetProps
- package.json / devDependencies
- lucide-react / TimeBlockDrawer.tsx
- @supabase/supabase-js / dashboard.service.ts
- forgot-password/page.tsx / ForgotPasswordPage()
- ActiveProjectsWidget() / DashboardHeader.tsx
- ProjectCreateDialogProps / InMemoryProjectRepository
- src_app_globals / layout.tsx
- JournalCalendarStrip.tsx / JournalCalendarStrip()
- InMemoryCalendarRepository / .clear()
- tsconfig.json / compilerOptions
- @testing-library/react / vitest
- .upsertIntention() / .upsertShutdownNotes()
- dependencies / clsx@^2.1.1
- .createMilestone() / .findMilestones()
- dashboard.api.test.ts / notes/page.tsx
- app/page.tsx / DashboardContent()
- IProjectRepository / .delete()
- notes/schemas.ts / contentFormatSchema
- calendar/schemas.ts / calendarQuerySchema
- studio/schemas.ts / CreateSocialPostInput
- zod@^4.6.7 / zod
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
1. `createClient()` - 138 edges
2. `getAuthenticatedUser()` - 137 edges
3. `apiSuccess()` - 94 edges
4. `next` - 91 edges
5. `react` - 81 edges
6. `Button` - 65 edges
7. `vitest` - 61 edges
8. `apiUnauthorized()` - 60 edges
9. `apiBadRequest()` - 60 edges
10. `getTaskRepository()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `AgendaViewProps` --references--> `CalendarEvent`  [EXTRACTED]
  src/components/calendar/AgendaView.tsx → src/modules/calendar/types.ts
- `DayViewProps` --references--> `CalendarEvent`  [EXTRACTED]
  src/components/calendar/DayView.tsx → src/modules/calendar/types.ts
- `MonthViewProps` --references--> `CalendarEvent`  [EXTRACTED]
  src/components/calendar/MonthView.tsx → src/modules/calendar/types.ts
- `WeekViewProps` --references--> `CalendarEvent`  [EXTRACTED]
  src/components/calendar/WeekView.tsx → src/modules/calendar/types.ts
- `GET()` --calls--> `getAuthenticatedUser()`  [EXTRACTED]
  src/app/api/v1/auth/me/route.ts → src/lib/supabase/auth.ts

## Import Cycles
- None detected.

## Communities (47 total, 4 thin omitted)

### Community 0 - "next.config.ts / nextConfig"
Cohesion: 0.06
Nodes (110): nextConfig, next, GET(), GET(), POST(), DELETE(), GET(), PATCH() (+102 more)

### Community 1 - "habits.api.test.ts / habits/[id]/archive/route.ts"
Cohesion: 0.06
Nodes (34): POST(), POST(), DELETE(), GET(), PATCH(), GET(), POST(), HabitsContent() (+26 more)

### Community 2 - "journal/[id]/route.ts / DELETE()"
Cohesion: 0.09
Nodes (27): DELETE(), GET(), PATCH(), GET(), POST(), GET(), JournalContent(), JournalPage() (+19 more)

### Community 3 - "NoteEditor.tsx / MarkdownPreview()"
Cohesion: 0.06
Nodes (20): MarkdownPreview(), NoteEditor(), NoteEditorProps, NoteCard(), NoteSidebar(), NoteSidebarProps, NotesView(), NotesViewProps (+12 more)

### Community 4 - "studio/page.tsx / metadata"
Cohesion: 0.09
Nodes (24): metadata, StudioContent(), StudioPage(), PostPreviewCard(), PostPreviewCardProps, SocialStudioView(), SocialStudioViewProps, getInMemorySocialPostRepository() (+16 more)

### Community 5 - "CalendarViewProps / EventModal.tsx"
Cohesion: 0.09
Nodes (15): CalendarViewProps, EventModalProps, TimeBlockDrawerProps, TodayAgendaProps, TaskCreateDialogProps, TaskItemProps, TaskListProps, InMemoryTaskRepository (+7 more)

### Community 6 - "calendar/page.tsx / CalendarContent()"
Cohesion: 0.14
Nodes (32): CalendarContent(), CalendarPage(), metadata, AgendaView(), AgendaViewProps, CalendarHeader(), CalendarHeaderProps, CalendarView() (+24 more)

### Community 7 - "FocusViewProps / InMemoryFocusRepository"
Cohesion: 0.11
Nodes (12): FocusViewProps, InMemoryFocusRepository, SupabaseFocusRepository, ActiveFocusSession, CompleteFocusSessionDTO, EntryType, FocusSession, IFocusRepository (+4 more)

### Community 8 - "search/route.ts / GET()"
Cohesion: 0.13
Nodes (17): GET(), CommandPaletteProps, SearchQueryInput, SearchQuerySchema, SearchResultTypeEnum, getSearchRepository(), InMemorySearchRepository, ISearchRepository (+9 more)

### Community 9 - "InboxListProps / InboxViewProps"
Cohesion: 0.09
Nodes (13): InboxListProps, InboxViewProps, InMemoryInboxRepository, SupabaseInboxRepository, CaptureSource, ConvertedEntityType, CreateInboxItemDTO, IInboxRepository (+5 more)

### Community 10 - "calendar.repository.ts / getInMemoryCalendarRepository()"
Cohesion: 0.16
Nodes (9): globalInMemoryCalendarRepo, CalendarService, CalendarEventFilters, ConflictAdvisory, CreateCalendarEventDTO, EventType, ICalendarRepository, MoveCalendarEventDTO (+1 more)

### Community 11 - "react / ProjectDetailView.tsx"
Cohesion: 0.21
Nodes (16): react, ProjectDetailView(), TaskCreateDialog(), TaskEmptyState(), TaskEmptyStateProps, StatusFilterOption, TaskFilterBar(), TaskFilterBarProps (+8 more)

### Community 12 - "QuickIngestBar.tsx / QuickIngestBar()"
Cohesion: 0.15
Nodes (16): QuickIngestBar(), QuickIngestBarProps, ISpeechRecognitionEvent, ISpeechRecognitionResult, IWindowSpeechRecognition, SpeechRecognitionConstructor, MockSpeechRecognition, useSpeechToText() (+8 more)

### Community 13 - "ActiveProjectsWidget.tsx / ActiveProjectsWidgetProps"
Cohesion: 0.19
Nodes (16): ActiveProjectsWidgetProps, priorityBadgeVariant, ProjectCard(), ProjectCardProps, statusBadgeVariant, ProjectCreateDialog(), ProjectDetailViewProps, ProjectFilterBar() (+8 more)

### Community 14 - "package.json / devDependencies"
Cohesion: 0.12
Nodes (21): devDependencies, jsdom@^31.0.0, tailwindcss@^4, @tailwindcss/turbopack@^4, @testing-library/react@^16.3.3, @types/node@^20, @types/react@^19, @types/react-dom@^19 (+13 more)

### Community 15 - "lucide-react / TimeBlockDrawer.tsx"
Cohesion: 0.24
Nodes (14): lucide-react, HabitCard(), colorOptions, HabitModal(), HabitModalProps, HabitsView(), InboxList(), InboxView() (+6 more)

### Community 16 - "@supabase/supabase-js / dashboard.service.ts"
Cohesion: 0.18
Nodes (11): @supabase/supabase-js, createDashboardService(), DashboardService, getDayRepository(), globalInMemoryDayRepo, IDayRepository, createDayService(), DayService (+3 more)

### Community 17 - "forgot-password/page.tsx / ForgotPasswordPage()"
Cohesion: 0.24
Nodes (13): ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), SignupPage(), checkWorkspace(), AppOrb(), AppOrbProps, emptySubscribe() (+5 more)

### Community 18 - "ActiveProjectsWidget() / DashboardHeader.tsx"
Cohesion: 0.16
Nodes (15): ActiveProjectsWidget(), DashboardHeader(), DashboardHeaderProps, DashboardMetrics(), DashboardMetricsProps, DashboardView(), DashboardViewProps, DynamicScenery() (+7 more)

### Community 19 - "ProjectCreateDialogProps / InMemoryProjectRepository"
Cohesion: 0.16
Nodes (6): ProjectCreateDialogProps, InMemoryProjectRepository, CreateProjectDTO, Project, ProjectFilters, UpdateProjectDTO

### Community 20 - "src_app_globals / layout.tsx"
Cohesion: 0.14
Nodes (14): inter, metadata, RootLayout(), AppShell(), AppShellProps, Header(), HeaderProps, routeTitleMap (+6 more)

### Community 21 - "JournalCalendarStrip.tsx / JournalCalendarStrip()"
Cohesion: 0.21
Nodes (13): JournalCalendarStrip(), JournalCalendarStripProps, JournalEditor(), moodOptions, JournalHistory(), JournalView(), mockEntry, CardContent (+5 more)

### Community 22 - "InMemoryCalendarRepository / .clear()"
Cohesion: 0.19
Nodes (3): InMemoryCalendarRepository, SupabaseCalendarRepository, CalendarEvent

### Community 23 - "tsconfig.json / compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 24 - "@testing-library/react / vitest"
Cohesion: 0.21
Nodes (6): @testing-library/react, vitest, TodayAgenda(), pushMock, Badge(), BadgeProps

### Community 25 - ".upsertIntention() / .upsertShutdownNotes()"
Cohesion: 0.21
Nodes (3): InMemoryDayRepository, SupabaseDayRepository, DailyPlan

### Community 26 - "dependencies / clsx@^2.1.1"
Cohesion: 0.13
Nodes (15): dependencies, clsx@^2.1.1, cmdk@^1.1.1, lucide-react@^1.69.0, next@16.4.5, react@19.3.0, react-dom@19.3.0, @supabase/supabase-js@^2.119.0 (+7 more)

### Community 27 - ".createMilestone() / .findMilestones()"
Cohesion: 0.19
Nodes (3): SupabaseProjectRepository, CreateMilestoneDTO, ProjectMilestone

### Community 28 - "dashboard.api.test.ts / notes/page.tsx"
Cohesion: 0.27
Nodes (8): metadata, NotesContent(), NotesPage(), getInMemoryDayRepository(), getInMemoryProjectRepository(), getProjectRepository(), globalInMemoryProjectRepo, getInMemoryTaskRepository()

### Community 29 - "app/page.tsx / DashboardContent()"
Cohesion: 0.24
Nodes (9): DashboardContent(), HomePage(), metadata, metadata, ProjectsPage(), metadata, TasksPage(), PageShell() (+1 more)

### Community 32 - "notes/schemas.ts / contentFormatSchema"
Cohesion: 0.23
Nodes (10): contentFormatSchema, CreateNoteInput, CreateNoteLinkInput, createNoteLinkSchema, createNoteSchema, linkTypeSchema, noteQuerySchema, noteTypeSchema (+2 more)

### Community 33 - "calendar/schemas.ts / calendarQuerySchema"
Cohesion: 0.27
Nodes (9): calendarQuerySchema, conflictQuerySchema, CreateCalendarEventInput, createCalendarEventSchema, eventTypeSchema, MoveCalendarEventInput, moveCalendarEventSchema, UpdateCalendarEventInput (+1 more)

### Community 34 - "studio/schemas.ts / CreateSocialPostInput"
Cohesion: 0.22
Nodes (9): CreateSocialPostInput, CreateSocialPostSchema, MediaTypeEnum, PlatformTypeEnum, PostFilterInput, PostFilterSchema, PostStatusEnum, UpdateSocialPostInput (+1 more)

### Community 35 - "zod@^4.6.7 / zod"
Cohesion: 0.28
Nodes (7): zod@^4.6.7, zod, captureTypeSchema, createInboxItemSchema, inboxStatusSchema, processInboxItemSchema, updateInboxItemSchema

### Community 36 - "scripts / build"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:watch, typecheck

### Community 37 - "day/schemas.ts / DateQueryInput"
Cohesion: 0.36
Nodes (6): DateQueryInput, dateQuerySchema, UpdateIntentionInput, updateIntentionSchema, UpdateShutdownNotesInput, updateShutdownNotesSchema

### Community 38 - "projects/schemas.ts / CreateMilestoneSchema"
Cohesion: 0.39
Nodes (6): CreateMilestoneSchema, CreateProjectSchema, ProjectPriorityEnum, ProjectQuerySchema, ProjectStatusEnum, UpdateProjectSchema

### Community 39 - "@supabase/ssr@^0.12.7 / @supabase/ssr"
Cohesion: 0.38
Nodes (5): @supabase/ssr@^0.12.7, @supabase/ssr, updateSession(), config, middleware()

### Community 40 - "@testing-library/jest-dom@^7.0.1 / @testing-library/jest-dom"
Cohesion: 0.29
Nodes (3): @testing-library/jest-dom@^7.0.1, @testing-library/jest-dom, ResizeObserver

### Community 41 - "focus/schemas.ts / abandonFocusSessionSchema"
Cohesion: 0.43
Nodes (5): abandonFocusSessionSchema, completeFocusSessionSchema, sessionModeSchema, sessionStatusSchema, startFocusSessionSchema

### Community 42 - "tasks/schemas.ts / CreateTaskSchema"
Cohesion: 0.43
Nodes (5): CreateTaskSchema, TaskPriorityEnum, TaskQuerySchema, TaskStatusEnum, UpdateTaskSchema

### Community 43 - "eslint.config.mjs / eslintConfig"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.5, eslint, eslint-config-next

### Community 45 - "pnpm-workspace.yaml / allowBuilds"
Cohesion: 0.50
Nodes (3): allowBuilds, sharp, unrs-resolver

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 11` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 24`, `Community 26`, `Community 28`, `Community 29`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.062906100856765 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Community 24` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 28`, `Community 32`, `Community 33`, `Community 34`, `Community 35`, `Community 37`, `Community 38`, `Community 41`, `Community 42`, `Community 44`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.061782661782661785 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 39`, `Community 8`, `Community 11`, `Community 13`, `Community 14`, `Community 17`, `Community 18`, `Community 20`, `Community 24`, `Community 26`, `Community 28`, `Community 29`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08509615384615385 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06292966684294024 - nodes in this community are weakly interconnected._