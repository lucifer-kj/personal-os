# Graph Report - personal-os  (2026-11-06)

## Corpus Check
- 165 files · ~73,515 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 2, (none) 1, .ico 1)

## Summary
- 640 nodes · 2175 edges · 25 communities (23 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- next.config.ts / nextConfig
- @supabase/supabase-js / dashboard.api.test.ts
- focus.api.test.ts / abandon/route.ts
- InboxListProps / InboxViewProps
- TodayAgendaProps / TaskItemProps
- zod@^4.6.7 / zod
- @testing-library/react / vitest
- ActiveProjectsWidget.tsx / ActiveProjectsWidgetProps
- forgot-password/page.tsx / ForgotPasswordPage()
- lucide-react / src_app_globals
- tsconfig.json / compilerOptions
- react / TaskCreateDialog.tsx
- devDependencies / jsdom@^31.0.0
- ActiveProjectsWidget() / DashboardMetrics.tsx
- dependencies / clsx@^2.1.1
- InboxList.tsx / InboxList()
- package.json / tailwindcss@^4
- projects/page.tsx / metadata
- DashboardHeader.tsx / DashboardHeader()
- scripts / build
- @supabase/ssr@^0.12.7 / @supabase/ssr
- eslint.config.mjs / eslintConfig
- @vitejs/plugin-react@^6.2.1 / ref_node_path
- pnpm-workspace.yaml / allowBuilds

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 65 edges
2. `getAuthenticatedUser()` - 64 edges
3. `next` - 55 edges
4. `apiSuccess()` - 53 edges
5. `react` - 50 edges
6. `Task` - 40 edges
7. `Button` - 39 edges
8. `vitest` - 33 edges
9. `apiError()` - 30 edges
10. `getTaskRepository()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getAuthenticatedUser()`  [EXTRACTED]
  src/app/api/v1/auth/me/route.ts → src/lib/supabase/auth.ts
- `PATCH()` --calls--> `createDayService()`  [EXTRACTED]
  src/app/api/v1/day/intention/route.ts → src/modules/day/day.service.ts
- `GET()` --calls--> `createDayService()`  [EXTRACTED]
  src/app/api/v1/day/route.ts → src/modules/day/day.service.ts
- `POST()` --calls--> `apiBadRequest()`  [EXTRACTED]
  src/app/api/v1/focus/[id]/abandon/route.ts → src/lib/api/response.ts
- `POST()` --calls--> `apiSuccess()`  [EXTRACTED]
  src/app/api/v1/focus/[id]/abandon/route.ts → src/lib/api/response.ts

## Import Cycles
- None detected.

## Communities (25 total, 2 thin omitted)

### Community 0 - "next.config.ts / nextConfig"
Cohesion: 0.09
Nodes (65): nextConfig, next, GET(), GET(), PATCH(), GET(), POST(), DELETE() (+57 more)

### Community 1 - "@supabase/supabase-js / dashboard.api.test.ts"
Cohesion: 0.05
Nodes (29): @supabase/supabase-js, ProjectCreateDialogProps, DashboardService, getDayRepository(), getInMemoryDayRepository(), globalInMemoryDayRepo, IDayRepository, InMemoryDayRepository (+21 more)

### Community 2 - "focus.api.test.ts / abandon/route.ts"
Cohesion: 0.08
Nodes (31): POST(), POST(), POST(), POST(), GET(), POST(), FocusContent(), FocusPage() (+23 more)

### Community 3 - "InboxListProps / InboxViewProps"
Cohesion: 0.10
Nodes (14): InboxListProps, InboxViewProps, globalInMemoryInboxRepo, InMemoryInboxRepository, SupabaseInboxRepository, CaptureSource, ConvertedEntityType, CreateInboxItemDTO (+6 more)

### Community 4 - "TodayAgendaProps / TaskItemProps"
Cohesion: 0.11
Nodes (10): TodayAgendaProps, TaskItemProps, TaskListProps, InMemoryTaskRepository, ITaskRepository, SupabaseTaskRepository, TaskService, Task (+2 more)

### Community 5 - "zod@^4.6.7 / zod"
Cohesion: 0.09
Nodes (24): zod@^4.6.7, zod, DateQueryInput, dateQuerySchema, UpdateIntentionInput, updateIntentionSchema, UpdateShutdownNotesInput, updateShutdownNotesSchema (+16 more)

### Community 6 - "@testing-library/react / vitest"
Cohesion: 0.19
Nodes (15): @testing-library/react, vitest, TodayAgenda(), ProjectDetailView(), priorityBadgeVariant, TaskItem(), Badge(), BadgeProps (+7 more)

### Community 7 - "ActiveProjectsWidget.tsx / ActiveProjectsWidgetProps"
Cohesion: 0.17
Nodes (18): ActiveProjectsWidgetProps, priorityBadgeVariant, ProjectCard(), ProjectCardProps, statusBadgeVariant, ProjectCreateDialog(), ProjectDetailViewProps, ProjectFilterBar() (+10 more)

### Community 8 - "forgot-password/page.tsx / ForgotPasswordPage()"
Cohesion: 0.24
Nodes (13): ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), SignupPage(), checkWorkspace(), AppOrb(), AppOrbProps, emptySubscribe() (+5 more)

### Community 9 - "lucide-react / src_app_globals"
Cohesion: 0.15
Nodes (14): lucide-react, inter, metadata, RootLayout(), AppShell(), AppShellProps, Header(), HeaderProps (+6 more)

### Community 10 - "tsconfig.json / compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "react / TaskCreateDialog.tsx"
Cohesion: 0.25
Nodes (11): react, TaskCreateDialogProps, TaskEmptyState(), TaskEmptyStateProps, StatusFilterOption, TaskFilterBar(), TaskFilterBarProps, TaskList() (+3 more)

### Community 12 - "devDependencies / jsdom@^31.0.0"
Cohesion: 0.14
Nodes (13): devDependencies, jsdom@^31.0.0, @tailwindcss/turbopack@^4, @testing-library/jest-dom@^7.0.1, @testing-library/react@^16.3.3, @types/node@^20, @types/react-dom@^19, vitest@^5.1.0 (+5 more)

### Community 13 - "ActiveProjectsWidget() / DashboardMetrics.tsx"
Cohesion: 0.26
Nodes (10): ActiveProjectsWidget(), DashboardMetrics(), DashboardMetricsProps, DashboardView(), DashboardViewProps, QuickCaptureCard(), QuickCaptureCardProps, TaskCreateDialog() (+2 more)

### Community 14 - "dependencies / clsx@^2.1.1"
Cohesion: 0.15
Nodes (13): dependencies, clsx@^2.1.1, lucide-react@^1.69.0, next@16.4.5, react@19.3.0, react-dom@19.3.0, @supabase/supabase-js@^2.119.0, tailwind-merge@^3.7.0 (+5 more)

### Community 15 - "InboxList.tsx / InboxList()"
Cohesion: 0.35
Nodes (7): InboxList(), InboxView(), QuickCaptureModal(), QuickCaptureModalProps, Button, ButtonProps, CaptureType

### Community 17 - "package.json / tailwindcss@^4"
Cohesion: 0.18
Nodes (10): tailwindcss@^4, @types/react@^19, typescript@^5, name, packageManager, private, version, tailwindcss (+2 more)

### Community 18 - "projects/page.tsx / metadata"
Cohesion: 0.33
Nodes (6): metadata, ProjectsPage(), metadata, TasksPage(), PageShell(), PageShellProps

### Community 19 - "DashboardHeader.tsx / DashboardHeader()"
Cohesion: 0.33
Nodes (6): DashboardHeader(), DashboardHeaderProps, DynamicScenery(), DynamicSceneryProps, getTimeOfDay(), TimeOfDay

### Community 20 - "scripts / build"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:watch, typecheck

### Community 21 - "@supabase/ssr@^0.12.7 / @supabase/ssr"
Cohesion: 0.38
Nodes (5): @supabase/ssr@^0.12.7, @supabase/ssr, updateSession(), config, middleware()

### Community 22 - "eslint.config.mjs / eslintConfig"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.5, eslint, eslint-config-next

### Community 24 - "pnpm-workspace.yaml / allowBuilds"
Cohesion: 0.50
Nodes (3): allowBuilds, sharp, unrs-resolver

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 0` to `Community 1`, `Community 2`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 13`, `Community 14`, `Community 17`, `Community 18`, `Community 19`, `Community 21`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09362507889753839 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Community 11` to `Community 0`, `Community 2`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0506872852233677 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Community 6` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 15`, `Community 17`, `Community 19`, `Community 23`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._