# Graph Report - personal-os  (2026-11-06)

## Corpus Check
- 189 files · ~85,161 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .ico 1)

## Summary
- 762 nodes · 2730 edges · 30 communities (27 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 101 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- next.config.ts / nextConfig
- calendar/page.tsx / CalendarContent()
- zod@^4.6.7 / zod
- FocusViewProps / focus.repository.ts
- InboxListProps / InboxViewProps
- CalendarViewProps / TimeBlockDrawerProps
- ProjectCreateDialogProps / .create()
- lucide-react / forgot-password/page.tsx
- react / TodayAgenda.tsx
- src_app_globals / layout.tsx
- IDayRepository / .findByDate()
- @supabase/supabase-js / dashboard.api.test.ts
- InMemoryProjectRepository / .clear()
- TimeBlockDrawer.tsx / ProjectCreateDialog.tsx
- app/page.tsx / DashboardContent()
- tsconfig.json / compilerOptions
- @testing-library/react / vitest
- ActiveProjectsWidget.tsx / ActiveProjectsWidget()
- devDependencies / jsdom@^31.0.0
- dependencies / clsx@^2.1.1
- package.json / tailwindcss@^4
- DashboardHeader.tsx / DashboardHeader()
- InboxList.tsx / InboxList()
- scripts / build
- @supabase/ssr@^0.12.7 / @supabase/ssr
- eslint.config.mjs / eslintConfig
- @vitejs/plugin-react@^6.2.1 / ref_node_path
- pnpm-workspace.yaml / allowBuilds
- DashboardService / .constructor()

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 80 edges
2. `getAuthenticatedUser()` - 79 edges
3. `apiSuccess()` - 66 edges
4. `next` - 62 edges
5. `react` - 59 edges
6. `Button` - 49 edges
7. `Task` - 47 edges
8. `getTaskRepository()` - 42 edges
9. `apiUnauthorized()` - 41 edges
10. `apiBadRequest()` - 41 edges

## Surprising Connections (you probably didn't know these)
- `ActiveProjectsWidgetProps` --references--> `ProjectWithStats`  [EXTRACTED]
  src/components/dashboard/ActiveProjectsWidget.tsx → src/modules/projects/types.ts
- `GET()` --calls--> `getAuthenticatedUser()`  [EXTRACTED]
  src/app/api/v1/auth/me/route.ts → src/lib/supabase/auth.ts
- `GET()` --calls--> `createDashboardService()`  [EXTRACTED]
  src/app/api/v1/dashboard/route.ts → src/modules/dashboard/dashboard.service.ts
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/callback/route.ts → src/lib/supabase/server.ts
- `CalendarContent()` --calls--> `getAuthenticatedUser()`  [EXTRACTED]
  src/app/calendar/page.tsx → src/lib/supabase/auth.ts

## Import Cycles
- None detected.

## Communities (30 total, 3 thin omitted)

### Community 0 - "next.config.ts / nextConfig"
Cohesion: 0.09
Nodes (82): nextConfig, next, GET(), GET(), POST(), DELETE(), GET(), PATCH() (+74 more)

### Community 1 - "calendar/page.tsx / CalendarContent()"
Cohesion: 0.06
Nodes (44): CalendarContent(), CalendarPage(), metadata, AgendaView(), AgendaViewProps, CalendarHeader(), CalendarHeaderProps, CalendarView() (+36 more)

### Community 2 - "zod@^4.6.7 / zod"
Cohesion: 0.06
Nodes (38): zod@^4.6.7, zod, calendarQuerySchema, conflictQuerySchema, CreateCalendarEventInput, createCalendarEventSchema, eventTypeSchema, MoveCalendarEventInput (+30 more)

### Community 3 - "FocusViewProps / focus.repository.ts"
Cohesion: 0.10
Nodes (13): FocusViewProps, globalInMemoryFocusRepo, InMemoryFocusRepository, SupabaseFocusRepository, ActiveFocusSession, CompleteFocusSessionDTO, EntryType, FocusSession (+5 more)

### Community 4 - "InboxListProps / InboxViewProps"
Cohesion: 0.09
Nodes (14): InboxListProps, InboxViewProps, globalInMemoryInboxRepo, InMemoryInboxRepository, SupabaseInboxRepository, CaptureSource, ConvertedEntityType, CreateInboxItemDTO (+6 more)

### Community 5 - "CalendarViewProps / TimeBlockDrawerProps"
Cohesion: 0.10
Nodes (14): CalendarViewProps, TimeBlockDrawerProps, TodayAgendaProps, TaskCreateDialogProps, TaskItemProps, TaskListProps, InMemoryTaskRepository, ITaskRepository (+6 more)

### Community 6 - "ProjectCreateDialogProps / .create()"
Cohesion: 0.14
Nodes (7): ProjectCreateDialogProps, IProjectRepository, ProjectService, CreateProjectDTO, Project, ProjectFilters, UpdateProjectDTO

### Community 7 - "lucide-react / forgot-password/page.tsx"
Cohesion: 0.19
Nodes (17): lucide-react, ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), SignupPage(), checkWorkspace(), AppOrb(), AppOrbProps (+9 more)

### Community 8 - "react / TodayAgenda.tsx"
Cohesion: 0.18
Nodes (15): react, TodayAgenda(), TaskEmptyState(), TaskEmptyStateProps, StatusFilterOption, TaskFilterBar(), TaskFilterBarProps, priorityBadgeVariant (+7 more)

### Community 9 - "src_app_globals / layout.tsx"
Cohesion: 0.15
Nodes (16): inter, metadata, RootLayout(), AppShell(), AppShellProps, MobileNav(), MobileNavProps, NavItem (+8 more)

### Community 10 - "IDayRepository / .findByDate()"
Cohesion: 0.14
Nodes (7): IDayRepository, InMemoryDayRepository, SupabaseDayRepository, DailyPlan, DayMetrics, DayOverviewDTO, UpdateIntentionDTO

### Community 11 - "@supabase/supabase-js / dashboard.api.test.ts"
Cohesion: 0.23
Nodes (10): @supabase/supabase-js, getDayRepository(), getInMemoryDayRepository(), globalInMemoryDayRepo, DayService, getInMemoryProjectRepository(), getProjectRepository(), globalInMemoryProjectRepo (+2 more)

### Community 12 - "InMemoryProjectRepository / .clear()"
Cohesion: 0.15
Nodes (4): InMemoryProjectRepository, SupabaseProjectRepository, CreateMilestoneDTO, ProjectMilestone

### Community 13 - "TimeBlockDrawer.tsx / ProjectCreateDialog.tsx"
Cohesion: 0.27
Nodes (12): ProjectCreateDialog(), ProjectDetailView(), ProjectFilterBar(), ProjectFilterBarProps, ProjectStatusFilterOption, ProjectList(), TaskCreateDialog(), Button (+4 more)

### Community 14 - "app/page.tsx / DashboardContent()"
Cohesion: 0.17
Nodes (13): DashboardContent(), HomePage(), metadata, ProjectDetailContent(), ProjectDetailPage(), ProjectPageProps, metadata, ProjectsPage() (+5 more)

### Community 15 - "tsconfig.json / compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 16 - "@testing-library/react / vitest"
Cohesion: 0.19
Nodes (11): @testing-library/react, vitest, priorityBadgeVariant, ProjectCard(), ProjectCardProps, statusBadgeVariant, ProjectDetailViewProps, ProjectListProps (+3 more)

### Community 17 - "ActiveProjectsWidget.tsx / ActiveProjectsWidget()"
Cohesion: 0.24
Nodes (10): ActiveProjectsWidget(), ActiveProjectsWidgetProps, DashboardMetrics(), DashboardMetricsProps, DashboardView(), DashboardViewProps, QuickCaptureCard(), QuickCaptureCardProps (+2 more)

### Community 18 - "devDependencies / jsdom@^31.0.0"
Cohesion: 0.14
Nodes (13): devDependencies, jsdom@^31.0.0, @tailwindcss/turbopack@^4, @testing-library/jest-dom@^7.0.1, @testing-library/react@^16.3.3, @types/node@^20, @types/react-dom@^19, vitest@^5.1.0 (+5 more)

### Community 19 - "dependencies / clsx@^2.1.1"
Cohesion: 0.15
Nodes (13): dependencies, clsx@^2.1.1, lucide-react@^1.69.0, next@16.4.5, react@19.3.0, react-dom@19.3.0, @supabase/supabase-js@^2.119.0, tailwind-merge@^3.7.0 (+5 more)

### Community 21 - "package.json / tailwindcss@^4"
Cohesion: 0.18
Nodes (10): tailwindcss@^4, @types/react@^19, typescript@^5, name, packageManager, private, version, tailwindcss (+2 more)

### Community 22 - "DashboardHeader.tsx / DashboardHeader()"
Cohesion: 0.33
Nodes (6): DashboardHeader(), DashboardHeaderProps, DynamicScenery(), DynamicSceneryProps, getTimeOfDay(), TimeOfDay

### Community 23 - "InboxList.tsx / InboxList()"
Cohesion: 0.39
Nodes (5): InboxList(), InboxView(), QuickCaptureModal(), QuickCaptureModalProps, CaptureType

### Community 24 - "scripts / build"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:watch, typecheck

### Community 25 - "@supabase/ssr@^0.12.7 / @supabase/ssr"
Cohesion: 0.38
Nodes (5): @supabase/ssr@^0.12.7, @supabase/ssr, updateSession(), config, middleware()

### Community 26 - "eslint.config.mjs / eslintConfig"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.5, eslint, eslint-config-next

### Community 28 - "pnpm-workspace.yaml / allowBuilds"
Cohesion: 0.50
Nodes (3): allowBuilds, sharp, unrs-resolver

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 0` to `Community 1`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 19`, `Community 21`, `Community 22`, `Community 25`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09193650793650794 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Community 8` to `Community 0`, `Community 1`, `Community 7`, `Community 9`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 19`, `Community 21`, `Community 22`, `Community 23`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.061782661782661785 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Community 16` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 18`, `Community 21`, `Community 22`, `Community 23`, `Community 27`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0563265306122449 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._