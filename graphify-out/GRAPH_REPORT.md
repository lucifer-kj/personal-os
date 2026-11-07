# Graph Report - personal-os  (2026-11-07)

## Corpus Check
- 294 files · ~128,661 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .ico 1)

## Summary
- 1312 nodes · 4752 edges · 44 communities (38 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 200 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- next.config.ts / nextConfig
- habits.api.test.ts / habits/[id]/archive/route.ts
- AgendaViewProps / CalendarViewProps
- journal/[id]/route.ts / DELETE()
- studio/page.tsx / metadata
- radar/page.tsx / metadata
- NoteEditor.tsx / MarkdownPreview()
- InboxList.tsx / InboxList()
- focus.repository.ts / getInMemoryFocusRepository()
- search/route.ts / GET()
- lucide-react / calendar/page.tsx
- react / forgot-password/page.tsx
- tasks/page.tsx / metadata
- projects/page.tsx / metadata
- @testing-library/react / TodayAgenda.tsx
- package.json / devDependencies
- ProjectCreateDialogProps / .create()
- dependencies / canvas-confetti@^1.9.4
- @supabase/supabase-js / dashboard.service.ts
- tsconfig.json / compilerOptions
- IDayRepository / .upsertIntention()
- src_app_globals / layout.tsx
- HabitsPage() / JournalPage()
- InMemoryProjectRepository / .clear()
- .constructor() / IProjectRepository
- notes/schemas.ts / contentFormatSchema
- studio/schemas.ts / CreateSocialPostInput
- vitest / dashboard.api.test.ts
- OrbState / DashboardHeader.tsx
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
- tailwind-merge@^3.7.0 / tailwind-merge
- thinking-orbs@^0.3.2 / thinking-orbs

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 153 edges
2. `getAuthenticatedUser()` - 152 edges
3. `apiSuccess()` - 107 edges
4. `next` - 100 edges
5. `react` - 84 edges
6. `Button` - 65 edges
7. `vitest` - 64 edges
8. `apiUnauthorized()` - 60 edges
9. `apiBadRequest()` - 60 edges
10. `getTaskRepository()` - 53 edges

## Surprising Connections (you probably didn't know these)
- `TodayAgendaProps` --references--> `Task`  [EXTRACTED]
  src/components/dashboard/TodayAgenda.tsx → src/modules/tasks/types.ts
- `FocusViewProps` --references--> `ActiveFocusSession`  [EXTRACTED]
  src/components/focus/FocusView.tsx → src/modules/focus/types.ts
- `JournalHistoryProps` --references--> `JournalEntry`  [EXTRACTED]
  src/components/journal/JournalHistory.tsx → src/modules/journal/types.ts
- `TaskItemProps` --references--> `Task`  [EXTRACTED]
  src/components/tasks/TaskItem.tsx → src/modules/tasks/types.ts
- `TaskListProps` --references--> `Task`  [EXTRACTED]
  src/components/tasks/TaskList.tsx → src/modules/tasks/types.ts

## Import Cycles
- None detected.

## Communities (44 total, 6 thin omitted)

### Community 0 - "next.config.ts / nextConfig"
Cohesion: 0.06
Nodes (134): nextConfig, next, GET(), GET(), POST(), DELETE(), GET(), PATCH() (+126 more)

### Community 1 - "habits.api.test.ts / habits/[id]/archive/route.ts"
Cohesion: 0.05
Nodes (48): POST(), POST(), DELETE(), GET(), PATCH(), GET(), POST(), HabitsContent() (+40 more)

### Community 2 - "AgendaViewProps / CalendarViewProps"
Cohesion: 0.05
Nodes (22): AgendaViewProps, CalendarViewProps, DayViewProps, EventModalProps, MonthViewProps, TimeBlockDrawerProps, WeekViewProps, InMemoryCalendarRepository (+14 more)

### Community 3 - "journal/[id]/route.ts / DELETE()"
Cohesion: 0.08
Nodes (31): DELETE(), GET(), PATCH(), GET(), POST(), GET(), JournalContent(), metadata (+23 more)

### Community 4 - "studio/page.tsx / metadata"
Cohesion: 0.07
Nodes (31): metadata, StudioContent(), StudioPage(), PostPreviewCard(), PostPreviewCardProps, SocialStudioView(), SocialStudioViewProps, ISpeechRecognitionEvent (+23 more)

### Community 5 - "radar/page.tsx / metadata"
Cohesion: 0.07
Nodes (20): metadata, RadarContent(), RadarPage(), RadarView(), RadarViewProps, getInMemoryRadarRepository(), getRadarRepository(), globalInMemoryRadarRepo (+12 more)

### Community 6 - "NoteEditor.tsx / MarkdownPreview()"
Cohesion: 0.07
Nodes (21): MarkdownPreview(), NoteEditor(), NoteEditorProps, NoteCard(), NoteSidebar(), NoteSidebarProps, NotesView(), NotesViewProps (+13 more)

### Community 7 - "InboxList.tsx / InboxList()"
Cohesion: 0.08
Nodes (19): InboxList(), InboxListProps, InboxView(), InboxViewProps, QuickCaptureModal(), QuickCaptureModalProps, globalInMemoryInboxRepo, InMemoryInboxRepository (+11 more)

### Community 8 - "focus.repository.ts / getInMemoryFocusRepository()"
Cohesion: 0.11
Nodes (13): globalInMemoryFocusRepo, InMemoryFocusRepository, SupabaseFocusRepository, FocusService, ActiveFocusSession, CompleteFocusSessionDTO, EntryType, FocusSession (+5 more)

### Community 9 - "search/route.ts / GET()"
Cohesion: 0.12
Nodes (19): GET(), CommandPalette(), CommandPaletteProps, pushMock, SearchQueryInput, SearchQuerySchema, SearchResultTypeEnum, getSearchRepository() (+11 more)

### Community 10 - "lucide-react / calendar/page.tsx"
Cohesion: 0.17
Nodes (29): lucide-react, CalendarContent(), CalendarPage(), metadata, AgendaView(), CalendarHeader(), CalendarHeaderProps, CalendarView() (+21 more)

### Community 11 - "react / forgot-password/page.tsx"
Cohesion: 0.15
Nodes (23): react, ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), SignupPage(), checkWorkspace(), AppOrb(), AppOrbProps (+15 more)

### Community 12 - "tasks/page.tsx / metadata"
Cohesion: 0.12
Nodes (25): metadata, TasksPage(), DashboardMetrics(), DashboardMetricsProps, DashboardViewProps, ProjectDetailView(), ProjectDetailViewProps, TaskCreateDialog() (+17 more)

### Community 13 - "projects/page.tsx / metadata"
Cohesion: 0.16
Nodes (18): metadata, ProjectsPage(), ActiveProjectsWidget(), ActiveProjectsWidgetProps, priorityBadgeVariant, ProjectCard(), ProjectCardProps, statusBadgeVariant (+10 more)

### Community 14 - "@testing-library/react / TodayAgenda.tsx"
Cohesion: 0.16
Nodes (14): @testing-library/react, TodayAgenda(), TodayAgendaProps, JournalHistory(), JournalHistoryProps, Badge(), BadgeProps, CardContent (+6 more)

### Community 15 - "package.json / devDependencies"
Cohesion: 0.11
Nodes (23): devDependencies, jsdom@^31.0.0, tailwindcss@^4, @tailwindcss/turbopack@^4, @testing-library/react@^16.3.3, @types/canvas-confetti@^1.9.0, @types/node@^20, @types/react@^19 (+15 more)

### Community 16 - "ProjectCreateDialogProps / .create()"
Cohesion: 0.13
Nodes (6): ProjectCreateDialogProps, SupabaseProjectRepository, CreateProjectDTO, Project, ProjectFilters, UpdateProjectDTO

### Community 17 - "dependencies / canvas-confetti@^1.9.4"
Cohesion: 0.09
Nodes (23): dependencies, canvas-confetti@^1.9.4, clsx@^2.1.1, cmdk@^1.1.1, date-fns@^4.4.0, lucide-react@^1.69.0, next@16.4.5, react@19.3.0 (+15 more)

### Community 18 - "@supabase/supabase-js / dashboard.service.ts"
Cohesion: 0.19
Nodes (10): @supabase/supabase-js, createDashboardService(), DashboardService, getDayRepository(), globalInMemoryDayRepo, createDayService(), DayService, DayMetrics (+2 more)

### Community 19 - "tsconfig.json / compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "IDayRepository / .upsertIntention()"
Cohesion: 0.20
Nodes (4): IDayRepository, InMemoryDayRepository, SupabaseDayRepository, DailyPlan

### Community 21 - "src_app_globals / layout.tsx"
Cohesion: 0.18
Nodes (11): inter, metadata, RootLayout(), AppShell(), AppShellProps, Header(), MobileNav(), MobileNavProps (+3 more)

### Community 22 - "HabitsPage() / JournalPage()"
Cohesion: 0.20
Nodes (11): HabitsPage(), JournalPage(), DashboardContent(), HomePage(), metadata, ProjectDetailContent(), ProjectDetailPage(), ProjectPageProps (+3 more)

### Community 23 - "InMemoryProjectRepository / .clear()"
Cohesion: 0.24
Nodes (3): InMemoryProjectRepository, CreateMilestoneDTO, ProjectMilestone

### Community 26 - "notes/schemas.ts / contentFormatSchema"
Cohesion: 0.23
Nodes (10): contentFormatSchema, CreateNoteInput, CreateNoteLinkInput, createNoteLinkSchema, createNoteSchema, linkTypeSchema, noteQuerySchema, noteTypeSchema (+2 more)

### Community 27 - "studio/schemas.ts / CreateSocialPostInput"
Cohesion: 0.22
Nodes (9): CreateSocialPostInput, CreateSocialPostSchema, MediaTypeEnum, PlatformTypeEnum, PostFilterInput, PostFilterSchema, PostStatusEnum, UpdateSocialPostInput (+1 more)

### Community 28 - "vitest / dashboard.api.test.ts"
Cohesion: 0.40
Nodes (5): vitest, getInMemoryDayRepository(), getInMemoryProjectRepository(), globalInMemoryProjectRepo, getInMemoryTaskRepository()

### Community 29 - "OrbState / DashboardHeader.tsx"
Cohesion: 0.31
Nodes (7): OrbState, DashboardHeader(), DashboardHeaderProps, DynamicScenery(), DynamicSceneryProps, getTimeOfDay(), TimeOfDay

### Community 30 - "zod@^4.6.7 / zod"
Cohesion: 0.28
Nodes (7): zod@^4.6.7, zod, captureTypeSchema, createInboxItemSchema, inboxStatusSchema, processInboxItemSchema, updateInboxItemSchema

### Community 31 - "scripts / build"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:watch, typecheck

### Community 32 - "day/schemas.ts / DateQueryInput"
Cohesion: 0.36
Nodes (6): DateQueryInput, dateQuerySchema, UpdateIntentionInput, updateIntentionSchema, UpdateShutdownNotesInput, updateShutdownNotesSchema

### Community 33 - "projects/schemas.ts / CreateMilestoneSchema"
Cohesion: 0.39
Nodes (6): CreateMilestoneSchema, CreateProjectSchema, ProjectPriorityEnum, ProjectQuerySchema, ProjectStatusEnum, UpdateProjectSchema

### Community 34 - "@supabase/ssr@^0.12.7 / @supabase/ssr"
Cohesion: 0.38
Nodes (5): @supabase/ssr@^0.12.7, @supabase/ssr, updateSession(), config, middleware()

### Community 35 - "@testing-library/jest-dom@^7.0.1 / @testing-library/jest-dom"
Cohesion: 0.29
Nodes (3): @testing-library/jest-dom@^7.0.1, @testing-library/jest-dom, ResizeObserver

### Community 36 - "focus/schemas.ts / abandonFocusSessionSchema"
Cohesion: 0.43
Nodes (5): abandonFocusSessionSchema, completeFocusSessionSchema, sessionModeSchema, sessionStatusSchema, startFocusSessionSchema

### Community 37 - "tasks/schemas.ts / CreateTaskSchema"
Cohesion: 0.43
Nodes (5): CreateTaskSchema, TaskPriorityEnum, TaskQuerySchema, TaskStatusEnum, UpdateTaskSchema

### Community 38 - "eslint.config.mjs / eslintConfig"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.5, eslint, eslint-config-next

### Community 40 - "pnpm-workspace.yaml / allowBuilds"
Cohesion: 0.50
Nodes (3): allowBuilds, sharp, unrs-resolver

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 11` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 21`, `Community 22`, `Community 29`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.055320118478013214 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Community 0` to `Community 1`, `Community 34`, `Community 3`, `Community 4`, `Community 5`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 21`, `Community 22`, `Community 28`, `Community 29`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.050458003415618694 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Community 18` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 15`, `Community 17`, `Community 28`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05092592592592592 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07648401826484018 - nodes in this community are weakly interconnected._