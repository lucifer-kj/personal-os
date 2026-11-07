# Graph Report - personal-os  (2026-11-06)

## Corpus Check
- 208 files · ~94,693 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .ico 1)

## Summary
- 869 nodes · 3212 edges · 31 communities (29 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- next.config.ts / nextConfig
- archive/route.ts / POST()
- calendar.api.test.ts / GET()
- ProjectCreateDialogProps / project.repository.ts
- @supabase/supabase-js / dashboard.api.test.ts
- calendar/page.tsx / CalendarContent()
- TimeBlockDrawerProps / DashboardViewProps
- InboxListProps / InboxViewProps
- FocusViewProps / InMemoryFocusRepository
- react / CalendarView.test.tsx
- lucide-react / forgot-password/page.tsx
- package.json / devDependencies
- ActiveProjectsWidgetProps / ProjectCard.tsx
- tsconfig.json / compilerOptions
- src_app_globals / layout.tsx
- @testing-library/react / vitest
- ActiveProjectsWidget.tsx / ActiveProjectsWidget()
- dependencies / clsx@^2.1.1
- InboxList.tsx / InboxList()
- zod@^4.6.7 / zod
- scripts / build
- card.tsx / CardContent
- day/schemas.ts / DateQueryInput
- projects/schemas.ts / CreateMilestoneSchema
- @supabase/ssr@^0.12.7 / @supabase/ssr
- focus/schemas.ts / abandonFocusSessionSchema
- tasks/schemas.ts / CreateTaskSchema
- eslint.config.mjs / eslintConfig
- @vitejs/plugin-react@^6.2.1 / ref_node_path
- pnpm-workspace.yaml / allowBuilds

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 99 edges
2. `getAuthenticatedUser()` - 98 edges
3. `apiSuccess()` - 83 edges
4. `next` - 70 edges
5. `react` - 63 edges
6. `apiUnauthorized()` - 58 edges
7. `apiBadRequest()` - 58 edges
8. `Button` - 53 edges
9. `Task` - 51 edges
10. `getTaskRepository()` - 49 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getAuthenticatedUser()`  [EXTRACTED]
  src/app/api/v1/auth/me/route.ts → src/lib/supabase/auth.ts
- `GET()` --calls--> `apiBadRequest()`  [EXTRACTED]
  src/app/api/v1/calendar/conflicts/route.ts → src/lib/api/response.ts
- `GET()` --calls--> `apiSuccess()`  [EXTRACTED]
  src/app/api/v1/calendar/conflicts/route.ts → src/lib/api/response.ts
- `GET()` --calls--> `apiUnauthorized()`  [EXTRACTED]
  src/app/api/v1/calendar/conflicts/route.ts → src/lib/api/response.ts
- `GET()` --calls--> `getAuthenticatedUser()`  [EXTRACTED]
  src/app/api/v1/calendar/conflicts/route.ts → src/lib/supabase/auth.ts

## Import Cycles
- None detected.

## Communities (31 total, 2 thin omitted)

### Community 0 - "next.config.ts / nextConfig"
Cohesion: 0.09
Nodes (72): nextConfig, next, GET(), GET(), PATCH(), GET(), POST(), POST() (+64 more)

### Community 1 - "archive/route.ts / POST()"
Cohesion: 0.05
Nodes (48): POST(), DELETE(), GET(), POST(), POST(), DELETE(), GET(), PATCH() (+40 more)

### Community 2 - "calendar.api.test.ts / GET()"
Cohesion: 0.06
Nodes (39): GET(), POST(), DELETE(), GET(), PATCH(), GET(), POST(), POST() (+31 more)

### Community 3 - "ProjectCreateDialogProps / project.repository.ts"
Cohesion: 0.09
Nodes (13): ProjectCreateDialogProps, globalInMemoryProjectRepo, InMemoryProjectRepository, IProjectRepository, SupabaseProjectRepository, ProjectService, CreateMilestoneDTO, CreateProjectDTO (+5 more)

### Community 4 - "@supabase/supabase-js / dashboard.api.test.ts"
Cohesion: 0.09
Nodes (20): @supabase/supabase-js, DashboardContent(), HomePage(), metadata, createDashboardService(), DashboardService, getDayRepository(), getInMemoryDayRepository() (+12 more)

### Community 5 - "calendar/page.tsx / CalendarContent()"
Cohesion: 0.12
Nodes (34): CalendarContent(), CalendarPage(), metadata, ProjectDetailPage(), metadata, ProjectsPage(), metadata, TasksPage() (+26 more)

### Community 6 - "TimeBlockDrawerProps / DashboardViewProps"
Cohesion: 0.09
Nodes (15): TimeBlockDrawerProps, DashboardViewProps, TodayAgendaProps, TaskCreateDialogProps, TaskItemProps, TaskListProps, DashboardOverviewDTO, InMemoryTaskRepository (+7 more)

### Community 7 - "InboxListProps / InboxViewProps"
Cohesion: 0.10
Nodes (14): InboxListProps, InboxViewProps, globalInMemoryInboxRepo, InMemoryInboxRepository, SupabaseInboxRepository, CaptureSource, ConvertedEntityType, CreateInboxItemDTO (+6 more)

### Community 8 - "FocusViewProps / InMemoryFocusRepository"
Cohesion: 0.10
Nodes (12): FocusViewProps, InMemoryFocusRepository, SupabaseFocusRepository, ActiveFocusSession, CompleteFocusSessionDTO, EntryType, FocusSession, IFocusRepository (+4 more)

### Community 9 - "react / CalendarView.test.tsx"
Cohesion: 0.19
Nodes (16): react, ProjectDetailView(), TaskCreateDialog(), TaskEmptyState(), TaskEmptyStateProps, StatusFilterOption, TaskFilterBar(), TaskFilterBarProps (+8 more)

### Community 10 - "lucide-react / forgot-password/page.tsx"
Cohesion: 0.20
Nodes (17): lucide-react, ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), SignupPage(), checkWorkspace(), AppOrb(), AppOrbProps (+9 more)

### Community 11 - "package.json / devDependencies"
Cohesion: 0.11
Nodes (23): devDependencies, jsdom@^31.0.0, tailwindcss@^4, @tailwindcss/turbopack@^4, @testing-library/jest-dom@^7.0.1, @testing-library/react@^16.3.3, @types/node@^20, @types/react@^19 (+15 more)

### Community 12 - "ActiveProjectsWidgetProps / ProjectCard.tsx"
Cohesion: 0.19
Nodes (15): ActiveProjectsWidgetProps, priorityBadgeVariant, ProjectCard(), ProjectCardProps, statusBadgeVariant, ProjectCreateDialog(), ProjectDetailViewProps, ProjectFilterBar() (+7 more)

### Community 13 - "tsconfig.json / compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 14 - "src_app_globals / layout.tsx"
Cohesion: 0.18
Nodes (11): inter, metadata, RootLayout(), AppShell(), AppShellProps, Header(), MobileNav(), MobileNavProps (+3 more)

### Community 15 - "@testing-library/react / vitest"
Cohesion: 0.17
Nodes (9): @testing-library/react, vitest, DashboardHeader(), DashboardHeaderProps, DynamicScenery(), DynamicSceneryProps, getTimeOfDay(), TimeOfDay (+1 more)

### Community 16 - "ActiveProjectsWidget.tsx / ActiveProjectsWidget()"
Cohesion: 0.28
Nodes (9): ActiveProjectsWidget(), DashboardMetrics(), DashboardMetricsProps, DashboardView(), QuickCaptureCard(), QuickCaptureCardProps, TodayAgenda(), Card (+1 more)

### Community 17 - "dependencies / clsx@^2.1.1"
Cohesion: 0.15
Nodes (13): dependencies, clsx@^2.1.1, lucide-react@^1.69.0, next@16.4.5, react@19.3.0, react-dom@19.3.0, @supabase/supabase-js@^2.119.0, tailwind-merge@^3.7.0 (+5 more)

### Community 18 - "InboxList.tsx / InboxList()"
Cohesion: 0.27
Nodes (7): InboxList(), InboxView(), QuickCaptureModal(), QuickCaptureModalProps, Badge(), BadgeProps, CaptureType

### Community 20 - "zod@^4.6.7 / zod"
Cohesion: 0.28
Nodes (7): zod@^4.6.7, zod, captureTypeSchema, createInboxItemSchema, inboxStatusSchema, processInboxItemSchema, updateInboxItemSchema

### Community 21 - "scripts / build"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:watch, typecheck

### Community 22 - "card.tsx / CardContent"
Cohesion: 0.57
Nodes (6): CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn()

### Community 23 - "day/schemas.ts / DateQueryInput"
Cohesion: 0.36
Nodes (6): DateQueryInput, dateQuerySchema, UpdateIntentionInput, updateIntentionSchema, UpdateShutdownNotesInput, updateShutdownNotesSchema

### Community 24 - "projects/schemas.ts / CreateMilestoneSchema"
Cohesion: 0.39
Nodes (6): CreateMilestoneSchema, CreateProjectSchema, ProjectPriorityEnum, ProjectQuerySchema, ProjectStatusEnum, UpdateProjectSchema

### Community 25 - "@supabase/ssr@^0.12.7 / @supabase/ssr"
Cohesion: 0.38
Nodes (5): @supabase/ssr@^0.12.7, @supabase/ssr, updateSession(), config, middleware()

### Community 26 - "focus/schemas.ts / abandonFocusSessionSchema"
Cohesion: 0.43
Nodes (5): abandonFocusSessionSchema, completeFocusSessionSchema, sessionModeSchema, sessionStatusSchema, startFocusSessionSchema

### Community 27 - "tasks/schemas.ts / CreateTaskSchema"
Cohesion: 0.43
Nodes (5): CreateTaskSchema, TaskPriorityEnum, TaskQuerySchema, TaskStatusEnum, UpdateTaskSchema

### Community 28 - "eslint.config.mjs / eslintConfig"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.5, eslint, eslint-config-next

### Community 30 - "pnpm-workspace.yaml / allowBuilds"
Cohesion: 0.50
Nodes (3): allowBuilds, sharp, unrs-resolver

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 25`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08779298198076141 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Community 9` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 22`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05070958809276566 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Community 15` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 7`, `Community 9`, `Community 11`, `Community 12`, `Community 14`, `Community 16`, `Community 18`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 29`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06288568909785483 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09224318658280922 - nodes in this community are weakly interconnected._