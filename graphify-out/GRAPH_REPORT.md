# Graph Report - personal-os  (2026-11-09)

## Corpus Check
- 338 files · ~166,103 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .ico 1)

## Summary
- 2025 nodes · 6068 edges · 95 communities (87 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 223 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `704da40b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- apiSuccess
- HabitService
- CalendarEvent
- JournalEntry
- SocialPost
- RadarItem
- Note
- errors.ts
- FocusSession
- search.repository.ts
- CalendarService
- createClient
- react
- projects/types.ts
- Card
- package.json
- Project
- dependencies
- Task
- compilerOptions
- Personal OS --- Supabase Database Architecture & Specification
- AppShell.tsx
- PageShell
- InMemoryProjectRepository
- ProjectService
- notes/schemas.ts
- studio/schemas.ts
- apiUnauthorized
- DynamicScenery.tsx
- createClient
- scripts
- day/schemas.ts
- projects/schemas.ts
- context.ts
- ResizeObserver
- zod
- tasks/schemas.ts
- 3. Creative Thinking & Actionable Solutions
- Personal OS — Frontend Pages & Experience Specification
- allowBuilds
- server.ts
- mfa.ts
- vitest
- Personal OS — Master System Design & Agent Development Specification
- Personal OS — Design System (`design.md`)
- 9.3 Table contracts
- Sidebar.tsx
- Button
- InMemoryNoteRepository
- passkeys.ts
- 11.3 API endpoint inventory
- Personal OS — Production Design System Specification
- Personal OS — Backend Architecture & API Specification
- 5. Feature Domain Specifications
- 5. API endpoint inventory
- INoteRepository
- 10. Security Architecture
- Personal OS — Production Engineering & Agent Direction
- calendar/schemas.ts
- Personal OS — Page Design Guidelines & Reference Architecture
- 4. Code readability and design principles
- 13. Execution and Background Work Model
- 18. Antigravity + Graphify Spec-Driven Workflow
- 3. Visual and interaction quality bar
- 2. Architectural Decisions
- 6. Data model and relational schema guidance
- 8. Execution model: synchronous requests, jobs, schedules, and AI runs
- 14. AI Layer Roadmap and Model Abstraction
- 17. Testing Strategy
- 20. Implementation Sequence
- 7. Testing strategy and quality gates
- 22. Suggested Implementation Phases
- Personal OS — Architecture & Context Map
- 4. API conventions
- 2. Product Scope and Release Phases
- 3. Desktop and Mobile User Experience
- 9. Database Design and Canonical Schema
- 8. Token and context budget management
- 9. Gemini 3.8 model routing
- rss.service.ts
- 7. Security model
- 1. Product Vision and Definition
- 6. Recommended Technology Stack
- 2. Specification-driven execution
- apple-icon.tsx
- MockSpeechRecognition
- 11. Search and vector retrieval
- 6. Dependency and library selection policy
- 1. Purpose and Scope
- 20. Triggers and Database Functions
- 8.5 Knowledge graph tables
- 17. Database Integrity and Ownership Rules
- MILESTONE_TRACKER.md

## God Nodes (most connected - your core abstractions)
1. `apiSuccess()` - 125 edges
2. `next` - 121 edges
3. `createClient()` - 116 edges
4. `getAuthenticatedUser()` - 111 edges
5. `react` - 107 edges
6. `Button` - 82 edges
7. `vitest` - 79 edges
8. `apiError()` - 68 edges
9. `lucide-react` - 67 edges
10. `getRequestContext()` - 67 edges

## Surprising Connections (you probably didn't know these)
- `17. Unconstrained Tablet Viewport Stretching (`MobileFocusedDashboard.tsx` at 768px)` --references--> `MobileFocusedDashboard()`  [INFERRED]
  docs/ui-ux-audit/AUDIT_REPORT.md → src/components/dashboard/MobileFocusedDashboard.tsx
- `8. Hydration Mismatch in QuickIngestBar (`QuickIngestBar.tsx` line 48)` --references--> `useSpeechToText()`  [INFERRED]
  docs/ui-ux-audit/AUDIT_REPORT.md → src/lib/hooks/useSpeechToText.ts
- `Architecture Decisions Record (ADR) Summary` --references--> `AppOrb()`  [INFERRED]
  docs/progress/PROJECT_STATUS.md → src/components/brand/AppOrb.tsx
- `Core Workstation Modules` --references--> `AppOrb()`  [INFERRED]
  README.md → src/components/brand/AppOrb.tsx
- `3. Core Module Map` --references--> `Sidebar()`  [INFERRED]
  AGENTS.md → src/components/layout/Sidebar.tsx

## Import Cycles
- None detected.

## Communities (95 total, 8 thin omitted)

### Community 0 - "apiSuccess"
Cohesion: 0.08
Nodes (52): nextConfig, next, GET(), POST(), GET(), POST(), mockSelect, mockSessions (+44 more)

### Community 1 - "HabitService"
Cohesion: 0.06
Nodes (35): POST(), POST(), DELETE(), GET(), PATCH(), GET(), POST(), HabitCardProps (+27 more)

### Community 2 - "CalendarEvent"
Cohesion: 0.07
Nodes (40): AgendaView(), AgendaViewProps, CalendarHeader(), CalendarHeaderProps, CalendarView(), CalendarViewProps, DayView(), DayViewProps (+32 more)

### Community 3 - "JournalEntry"
Cohesion: 0.09
Nodes (27): DELETE(), GET(), PATCH(), GET(), POST(), GET(), JournalContent(), JournalPage() (+19 more)

### Community 4 - "SocialPost"
Cohesion: 0.10
Nodes (21): PostPreviewCard(), PostPreviewCardProps, SocialStudioView(), SocialStudioViewProps, getInMemorySocialPostRepository(), getSocialPostRepository(), globalInMemorySocialRepo, InMemorySocialPostRepository (+13 more)

### Community 5 - "RadarItem"
Cohesion: 0.06
Nodes (24): ParsedLineItem, parseDocketLine(), PlanMyDayModal(), PlanMyDayModalProps, RadarArticleSheetProps, CleanArticleData, RadarFloatingReaderModal(), RadarFloatingReaderModalProps (+16 more)

### Community 6 - "Note"
Cohesion: 0.19
Nodes (13): MarkdownPreview(), NoteEditor(), NoteEditorProps, NoteCard(), NoteSidebar(), NoteSidebarProps, NotesView(), NotesViewProps (+5 more)

### Community 7 - "errors.ts"
Cohesion: 0.06
Nodes (35): POST(), DELETE(), GET(), PATCH(), GET(), POST(), InboxListProps, InboxViewProps (+27 more)

### Community 8 - "FocusSession"
Cohesion: 0.10
Nodes (12): FocusViewProps, InMemoryFocusRepository, SupabaseFocusRepository, ActiveFocusSession, CompleteFocusSessionDTO, EntryType, FocusSession, IFocusRepository (+4 more)

### Community 9 - "search.repository.ts"
Cohesion: 0.13
Nodes (17): GET(), CommandPaletteProps, SearchQueryInput, SearchQuerySchema, SearchResultTypeEnum, getSearchRepository(), InMemorySearchRepository, ISearchRepository (+9 more)

### Community 10 - "CalendarService"
Cohesion: 0.22
Nodes (15): GET(), POST(), DELETE(), GET(), PATCH(), GET(), POST(), POST() (+7 more)

### Community 11 - "createClient"
Cohesion: 0.20
Nodes (14): ForgotPasswordPage(), LoginPage(), ResetPasswordPage(), SignupPage(), checkWorkspace(), AppOrb(), AppOrbProps, emptySubscribe() (+6 more)

### Community 12 - "react"
Cohesion: 0.11
Nodes (36): date-fns, lucide-react, react, HabitCard(), colorOptions, HabitModal(), HabitModalProps, HabitsView() (+28 more)

### Community 13 - "projects/types.ts"
Cohesion: 0.19
Nodes (16): ActiveProjectsWidgetProps, priorityBadgeVariant, ProjectCard(), ProjectCardProps, statusBadgeVariant, ProjectCreateDialog(), ProjectDetailViewProps, ProjectFilterBar() (+8 more)

### Community 14 - "Card"
Cohesion: 0.13
Nodes (23): ActiveProjectsWidget(), CurrentFocusCard(), CurrentFocusCardProps, SubtaskItem, DashboardMetrics(), DashboardMetricsProps, DashboardView(), DashboardViewProps (+15 more)

### Community 15 - "package.json"
Cohesion: 0.08
Nodes (30): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.5, jsdom@^31.0.0, tailwindcss@^4, @tailwindcss/turbopack@^4, @testing-library/react@^16.3.3 (+22 more)

### Community 16 - "Project"
Cohesion: 0.13
Nodes (6): ProjectCreateDialogProps, SupabaseProjectRepository, CreateProjectDTO, Project, ProjectFilters, UpdateProjectDTO

### Community 17 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, canvas-confetti@^1.9.4, clsx@^2.1.1, cmdk@^1.1.1, date-fns@^4.4.0, lucide-react@^1.69.0, next@16.4.5, react@19.3.0 (+17 more)

### Community 18 - "Task"
Cohesion: 0.06
Nodes (28): @supabase/supabase-js, EventModalProps, TimeBlockDrawerProps, TodayAgendaProps, TaskCreateDialogProps, TaskItemProps, TaskListProps, DashboardService (+20 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "Personal OS --- Supabase Database Architecture & Specification"
Cohesion: 0.03
Nodes (59): 10.1 `inbox_items`, 10. Inbox and Quick Capture, 11.1 `daily_reports`, 11. Reports and Analytics, 12.1 Architecture principles, 12.2 `ai_memories`, 12.3 `document_chunks`, 12.4 Search strategy (+51 more)

### Community 21 - "AppShell.tsx"
Cohesion: 0.08
Nodes (30): 3. Core Module Map, 6. Missing Quick Capture Trigger in Mobile Dock (`MobileNav.tsx`), inter, metadata, newsreader, RootLayout(), viewport, AppLockScreen() (+22 more)

### Community 22 - "PageShell"
Cohesion: 0.11
Nodes (21): HabitsContent(), HabitsPage(), metadata, InboxContent(), InboxPage(), metadata, DashboardContent(), HomePage() (+13 more)

### Community 23 - "InMemoryProjectRepository"
Cohesion: 0.26
Nodes (3): InMemoryProjectRepository, CreateMilestoneDTO, ProjectMilestone

### Community 26 - "notes/schemas.ts"
Cohesion: 0.23
Nodes (10): contentFormatSchema, CreateNoteInput, CreateNoteLinkInput, createNoteLinkSchema, createNoteSchema, linkTypeSchema, noteQuerySchema, noteTypeSchema (+2 more)

### Community 27 - "studio/schemas.ts"
Cohesion: 0.22
Nodes (9): CreateSocialPostInput, CreateSocialPostSchema, MediaTypeEnum, PlatformTypeEnum, PostFilterInput, PostFilterSchema, PostStatusEnum, UpdateSocialPostInput (+1 more)

### Community 28 - "apiUnauthorized"
Cohesion: 0.14
Nodes (28): GET(), PATCH(), GET(), POST(), DELETE(), GET(), POST(), POST() (+20 more)

### Community 29 - "DynamicScenery.tsx"
Cohesion: 0.11
Nodes (17): Architecture Decisions Record (ADR) Summary, Key Verification Status, Milestones Summary, Overview, Personal OS — Project Status, Architecture & System Overview, Core Workstation Modules, Local Development (+9 more)

### Community 30 - "createClient"
Cohesion: 0.13
Nodes (32): POST(), DELETE(), RouteParams, GET(), POST(), POST(), RouteParams, PATCH() (+24 more)

### Community 31 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:watch, typecheck

### Community 32 - "day/schemas.ts"
Cohesion: 0.36
Nodes (6): DateQueryInput, dateQuerySchema, UpdateIntentionInput, updateIntentionSchema, UpdateShutdownNotesInput, updateShutdownNotesSchema

### Community 33 - "projects/schemas.ts"
Cohesion: 0.39
Nodes (6): CreateMilestoneSchema, CreateProjectSchema, ProjectPriorityEnum, ProjectQuerySchema, ProjectStatusEnum, UpdateProjectSchema

### Community 34 - "context.ts"
Cohesion: 0.12
Nodes (32): DELETE(), GET(), POST(), DeviceInfo, getBrowserName(), getDeviceType(), getOsName(), parseUserAgent() (+24 more)

### Community 35 - "ResizeObserver"
Cohesion: 0.29
Nodes (3): @testing-library/jest-dom@^7.0.1, @testing-library/jest-dom, ResizeObserver

### Community 36 - "zod"
Cohesion: 0.31
Nodes (7): zod@^4.6.7, zod, abandonFocusSessionSchema, completeFocusSessionSchema, sessionModeSchema, sessionStatusSchema, startFocusSessionSchema

### Community 37 - "tasks/schemas.ts"
Cohesion: 0.43
Nodes (5): CreateTaskSchema, TaskPriorityEnum, TaskQuerySchema, TaskStatusEnum, UpdateTaskSchema

### Community 38 - "3. Creative Thinking & Actionable Solutions"
Cohesion: 0.05
Nodes (38): 10. Hardcoded Weather & City Text (`MobileFocusedDashboard.tsx` line 115), 11. Hardcoded Focus Hours in Mobile Stats Card (`MobileFocusedDashboard.tsx` line 281), 12. Synthetic / Cycled Time Slots in Dashboard Agenda (`TodayAgenda.tsx` lines 41–46 & 163), 13. UTC Date Shift Bug in Habit & Journal Check-ins (`HabitsView.tsx` & `JournalView.tsx`), 14. Missing Note/Project Conversion in Inbox Triage (`InboxList.tsx` line 250), 15. Inaccessible Delete Button on Mobile Tasks (`TaskItem.tsx` line 93), 16. Month Calendar Grid Cramping on Mobile (`CalendarView.tsx`), 17. Unconstrained Tablet Viewport Stretching (`MobileFocusedDashboard.tsx` at 768px) (+30 more)

### Community 39 - "Personal OS — Frontend Pages & Experience Specification"
Cohesion: 0.06
Nodes (35): 1. Frontend contract, 2. Global application shell, 3.10 Time Tracker / Focus, 3.11 Notes, 3.12 Journal, 3.13 Knowledge Graph, 3.14 Concepts, 3.15 Meetings (+27 more)

### Community 40 - "allowBuilds"
Cohesion: 0.50
Nodes (3): allowBuilds, sharp, unrs-resolver

### Community 41 - "server.ts"
Cohesion: 0.19
Nodes (17): POST(), POST(), POST(), POST(), GET(), POST(), FocusContent(), FocusPage() (+9 more)

### Community 42 - "mfa.ts"
Cohesion: 0.15
Nodes (22): RFC-6238, sonner, metadata, SettingsPage(), DeviceManagementCard(), DeviceSession, SecuritySettingsCard(), SettingsView() (+14 more)

### Community 44 - "vitest"
Cohesion: 0.10
Nodes (17): @testing-library/react, vitest, mockGetAuthenticatorAssuranceLevel, mockListFactors, mockPush, mockRefresh, mockSignInWithPassword, FocusView() (+9 more)

### Community 45 - "Personal OS — Master System Design & Agent Development Specification"
Cohesion: 0.08
Nodes (25): 0. How Agents Must Use This Specification, 12.1 Responsibilities, 12.2 Query key convention, 12.3 Mutation pattern, 12.4 Realtime policy, 12. Frontend Data, Cache, and Realtime Model, 15. Offline, PWA, and Mobile Constraints, 16. Performance and Reliability Targets (+17 more)

### Community 46 - "Personal OS — Design System (`design.md`)"
Cohesion: 0.08
Nodes (23): 10. Decision log, 1. Design intent, 2. Brand and palette, 3. Typography, 4. Spacing, grid, and layout, 5. App shell and navigation, 6. Component guidelines, 7. Dashboard composition (+15 more)

### Community 47 - "9.3 Table contracts"
Cohesion: 0.08
Nodes (24): 9.3 Table contracts, `audit_events`, `calendar_events`, `embeddings` (Phase 3; pgvector), `focus_sessions`, `goals`, `habit_checkins`, `habits` (+16 more)

### Community 48 - "Sidebar.tsx"
Cohesion: 0.19
Nodes (17): Logo(), LogoProps, LogoSize, LogoVariant, sizeMap, getSidebarIcon(), SIDEBAR_ICONS, Sidebar() (+9 more)

### Community 49 - "Button"
Cohesion: 0.17
Nodes (15): EventModal(), InboxList(), InboxView(), QuickCaptureModal(), QuickCaptureModalProps, QuickIngestBar(), RadarArticleSheet(), Button (+7 more)

### Community 50 - "InMemoryNoteRepository"
Cohesion: 0.12
Nodes (4): InMemoryNoteRepository, SupabaseNoteRepository, NoteLink, UpdateNoteDTO

### Community 51 - "passkeys.ts"
Cohesion: 0.23
Nodes (14): PasskeyButton(), PasskeyButtonProps, deletePasskey(), isPlatformAuthenticatorAvailable(), isWebAuthnSupported(), listPasskeys(), PasskeyAuthResult, PasskeyInfo (+6 more)

### Community 52 - "11.3 API endpoint inventory"
Cohesion: 0.11
Nodes (19): 11.1 API conventions, 11.2 HTTP status conventions, 11.3 API endpoint inventory, 11.4 API behavior and domain transitions, 11. API Contract, Calendar, Dashboard/day, Focus (+11 more)

### Community 53 - "Personal OS — Production Design System Specification"
Cohesion: 0.12
Nodes (15): 1.1 Non-Negotiable Tenets, 1. Vision & Non-Negotiable Principles, 2.1 Dark Obsidian Theme (Primary Workstation Mode), 2.2 Light Editorial Theme (Secondary Mode), 2. Color Palette & Semantic Tokens, 3. Typography System, 4.1 Spacing Scale, 4.2 Radii Tokens (+7 more)

### Community 54 - "Personal OS — Backend Architecture & API Specification"
Cohesion: 0.12
Nodes (15): 10. Realtime, caching, and client synchronization, 12. Observability and operational requirements, 13. Testing strategy, 14. Implementation phases, 15. Agent implementation rules (Antigravity / Graphify), 16. Open decisions requiring explicit approval, 17. Architecture recap, 1. Architecture decisions (+7 more)

### Community 55 - "5. Feature Domain Specifications"
Cohesion: 0.13
Nodes (15): 5.10 Journal and reviews, 5.11 Search, 5.12 Reports and analytics, 5.13 Notifications and reminders, 5.14 AI assistant and automations (future layer), 5.1 Home / Today Dashboard, 5.2 Inbox and Quick Capture, 5.3 Tasks (+7 more)

### Community 56 - "5. API endpoint inventory"
Cohesion: 0.14
Nodes (14): 5. API endpoint inventory, Analytics and reports, Automations, jobs, reminders, and notifications, Calendar and scheduling, Content studio and publishing queue, Dashboard and day view, Focus and time tracking, Goals (+6 more)

### Community 58 - "10. Security Architecture"
Cohesion: 0.18
Nodes (11): 10.10 Production security gates, 10.1 Threats, 10.2 Authentication, 10.3 Authorization, 10.4 Supabase client boundaries, 10.5 API boundary, 10.6 Storage security, 10.7 AI security (later phases) (+3 more)

### Community 59 - "Personal OS — Production Engineering & Agent Direction"
Cohesion: 0.18
Nodes (10): 10. AI and agent behavior rules, 11. Security, privacy, and data integrity, 12. Performance and reliability, 13. Documentation and Graphify context discipline, 14. Definition of Done (per spec), 15. Required completion report format, 16. Master instruction for Antigravity agents, 1. Mission and non-negotiable product direction (+2 more)

### Community 60 - "calendar/schemas.ts"
Cohesion: 0.27
Nodes (9): calendarQuerySchema, conflictQuerySchema, CreateCalendarEventInput, createCalendarEventSchema, eventTypeSchema, MoveCalendarEventInput, moveCalendarEventSchema, UpdateCalendarEventInput (+1 more)

### Community 61 - "Personal OS — Page Design Guidelines & Reference Architecture"
Cohesion: 0.22
Nodes (8): 1. Application Shell Structure, 2. Page Blueprint 1: Dashboard (`/`), 3. Page Blueprint 2: Notes (`/notes`), 4. Page Blueprint 3: The Radar (`/radar`), Personal OS — Page Design Guidelines & Reference Architecture, Structure & Layout Rhythm, Structure & Layout Rhythm, Structure & Layout Rhythm

### Community 62 - "4. Code readability and design principles"
Cohesion: 0.22
Nodes (9): 4.1 Keep the main path easy to follow, 4.2 Name things by meaning, 4.3 Keep external systems behind a boundary, 4.4 Make invalid states harder to represent, 4.5 Separate decisions from actions, 4.6 Make errors useful, 4.7 Keep changes focused, 4.8 Additional rules (+1 more)

### Community 63 - "13. Execution and Background Work Model"
Cohesion: 0.25
Nodes (8): 13.1 Execution classes, 13.2 Job lifecycle, 13.3 Job requirements, 13.4 Idempotency and side effects, 13.5 Transactional outbox, 13.6 Schedules and recurrence, 13.7 Agent execution (Phase 3/4), 13. Execution and Background Work Model

### Community 64 - "18. Antigravity + Graphify Spec-Driven Workflow"
Cohesion: 0.29
Nodes (7): 18.1 Agent roles (logical, not necessarily separate agents), 18.2 Standard development loop, 18.3 Feature spec template, 18.4 Antigravity agent operating rules, 18.5 Graphify knowledge graph expectations, 18.6 Global skills policy, 18. Antigravity + Graphify Spec-Driven Workflow

### Community 65 - "3. Visual and interaction quality bar"
Cohesion: 0.29
Nodes (7): 3.1 Design for the viewport, not a screenshot, 3.2 Spacing and composition, 3.3 Color, effects, and typography, 3.4 Interaction states are part of the design, 3.5 Responsive behavior and input modes, 3.6 Visual verification, 3. Visual and interaction quality bar

### Community 66 - "2. Architectural Decisions"
Cohesion: 0.29
Nodes (7): 2.1 Primary data store, 2.2 Supabase services, 2.3 Local-first and cloud database, 2.4 Single-user-first, ownership-ready, 2.5 UUID identifiers, 2.6 Timestamp conventions, 2. Architectural Decisions

### Community 67 - "6. Data model and relational schema guidance"
Cohesion: 0.33
Nodes (6): 6. Data model and relational schema guidance, Common columns, Constraints and indexing, Core entity map, Core tables (baseline), Timezone and date rules

### Community 68 - "8. Execution model: synchronous requests, jobs, schedules, and AI runs"
Cohesion: 0.33
Nodes (6): 8. Execution model: synchronous requests, jobs, schedules, and AI runs, AI execution and tools, Cron and recurring tasks, Durable job requirements, Job lifecycle, Work classification

### Community 69 - "14. AI Layer Roadmap and Model Abstraction"
Cohesion: 0.33
Nodes (6): 14.1 AI capability stages, 14.2 AI architecture, 14.3 Model/provider strategy, 14.4 Retrieval and AI memory, 14.5 Tool permission tiers, 14. AI Layer Roadmap and Model Abstraction

### Community 70 - "17. Testing Strategy"
Cohesion: 0.33
Nodes (6): 17.1 Unit tests, 17.2 Integration tests, 17.3 E2E tests, 17.4 Security tests, 17.5 CI gates, 17. Testing Strategy

### Community 71 - "20. Implementation Sequence"
Cohesion: 0.33
Nodes (6): 20. Implementation Sequence, Milestone 0 — Foundation, Milestone 1 — Core productivity vertical slices, Milestone 2 — Polish and reliability, Milestone 3 — AI assistance, Milestone 4 — Automation and integrations

### Community 72 - "7. Testing strategy and quality gates"
Cohesion: 0.33
Nodes (6): 7.1 Test pyramid, 7.2 Minimum test coverage for a feature, 7.3 Required gates, 7.4 Build and runtime validation, 7.5 Failure protocol, 7. Testing strategy and quality gates

### Community 73 - "22. Suggested Implementation Phases"
Cohesion: 0.33
Nodes (6): 22. Suggested Implementation Phases, Phase 1 --- Core foundation, Phase 2 --- Planning and productivity, Phase 3 --- Knowledge management, Phase 4 --- Content and reporting, Phase 5 --- AI and background infrastructure

### Community 74 - "Personal OS — Architecture & Context Map"
Cohesion: 0.40
Nodes (4): 1. Structural Knowledge Graph (Graphify), 2. Single-User Security & Authentication, Personal OS — Architecture & Context Map, This is NOT the Next.js you know

### Community 75 - "4. API conventions"
Cohesion: 0.40
Nodes (5): 4. API conventions, Authentication, Base path, HTTP conventions, Response envelope

### Community 76 - "2. Product Scope and Release Phases"
Cohesion: 0.40
Nodes (5): 2. Product Scope and Release Phases, Phase 1 — Productivity foundation (MVP), Phase 2 — Integrated productivity, Phase 3 — AI assistance layer, Phase 4 — AI-first workflows

### Community 77 - "3. Desktop and Mobile User Experience"
Cohesion: 0.40
Nodes (5): 3.1 Desktop: primary workspace, 3.2 Mobile: companion application, 3.3 Responsive rules, 3.4 Daily usage journey, 3. Desktop and Mobile User Experience

### Community 78 - "9. Database Design and Canonical Schema"
Cohesion: 0.40
Nodes (5): 9.1 Common conventions, 9.2 Core entity relationship diagram, 9.4 Relationship ownership integrity, 9.5 Constraints and indexes checklist, 9. Database Design and Canonical Schema

### Community 79 - "8. Token and context budget management"
Cohesion: 0.40
Nodes (5): 8.1 Spec-by-spec workflow, 8.2 Read only what is needed—but do not skip critical context, 8.3 Keep work packets small, 8.4 Checkpoint before context exhaustion, 8. Token and context budget management

### Community 80 - "9. Gemini 3.8 model routing"
Cohesion: 0.40
Nodes (5): 9. Gemini 3.8 model routing, High — complex or high-risk reasoning, Low — bounded, mechanical tasks, Medium — routine implementation, Recommended routing loop

### Community 81 - "rss.service.ts"
Cohesion: 0.40
Nodes (4): rss-parser@^3.13.0, rss-parser, ParsedFeedResult, parser

### Community 82 - "7. Security model"
Cohesion: 0.50
Nodes (4): 7. Security model, Identity and authorization, RLS baseline, Threat review checklist

### Community 83 - "1. Product Vision and Definition"
Cohesion: 0.50
Nodes (4): 1.1 Product pillars, 1.2 Product principles, 1.3 Initial target user and product stance, 1. Product Vision and Definition

### Community 84 - "6. Recommended Technology Stack"
Cohesion: 0.50
Nodes (4): 6.1 Frontend, 6.2 Backend and platform, 6.3 Architectural choices and guardrails, 6. Recommended Technology Stack

### Community 85 - "2. Specification-driven execution"
Cohesion: 0.50
Nodes (4): 2. Specification-driven execution, After coding each spec, Before coding each spec, During coding

### Community 88 - "11. Search and vector retrieval"
Cohesion: 0.67
Nodes (3): 11. Search and vector retrieval, Initial search, Semantic search (AI phase)

### Community 89 - "6. Dependency and library selection policy"
Cohesion: 0.67
Nodes (3): 6. Dependency and library selection policy, Before installing any library, Installation procedure

### Community 90 - "1. Purpose and Scope"
Cohesion: 0.67
Nodes (3): 1. Purpose and Scope, In scope, Out of scope

### Community 91 - "20. Triggers and Database Functions"
Cohesion: 0.67
Nodes (3): 20. Triggers and Database Functions, Transactional operations, `updated_at` trigger

### Community 92 - "8.5 Knowledge graph tables"
Cohesion: 0.67
Nodes (3): 8.5 Knowledge graph tables, `knowledge_entities`, `knowledge_relations`

## Knowledge Gaps
- **1 isolated node(s):** `RFC-6238`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 688 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `apiSuccess` to `HabitService`, `JournalEntry`, `RadarItem`, `errors.ts`, `search.repository.ts`, `CalendarService`, `createClient`, `react`, `projects/types.ts`, `Card`, `package.json`, `dependencies`, `AppShell.tsx`, `PageShell`, `apiUnauthorized`, `DynamicScenery.tsx`, `createClient`, `context.ts`, `server.ts`, `mfa.ts`, `Sidebar.tsx`, `apple-icon.tsx`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **What connects `RFC-6238` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `apiSuccess` be split into smaller, more focused modules?**
  _Cohesion score 0.08461306835290575 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `HabitService`, `CalendarEvent`, `JournalEntry`, `SocialPost`, `RadarItem`, `Note`, `search.repository.ts`, `CalendarService`, `createClient`, `projects/types.ts`, `Card`, `package.json`, `dependencies`, `AppShell.tsx`, `PageShell`, `apiUnauthorized`, `DynamicScenery.tsx`, `createClient`, `context.ts`, `server.ts`, `mfa.ts`, `vitest`, `Sidebar.tsx`, `Button`, `passkeys.ts`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `HabitService` be split into smaller, more focused modules?**
  _Cohesion score 0.06016929764355983 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `apiSuccess`, `HabitService`, `CalendarEvent`, `JournalEntry`, `SocialPost`, `RadarItem`, `Note`, `errors.ts`, `search.repository.ts`, `CalendarService`, `createClient`, `react`, `projects/types.ts`, `package.json`, `Task`, `AppShell.tsx`, `notes/schemas.ts`, `studio/schemas.ts`, `apiUnauthorized`, `createClient`, `day/schemas.ts`, `projects/schemas.ts`, `context.ts`, `zod`, `tasks/schemas.ts`, `server.ts`, `mfa.ts`, `Button`, `passkeys.ts`, `calendar/schemas.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `CalendarEvent` be split into smaller, more focused modules?**
  _Cohesion score 0.06744956338452274 - nodes in this community are weakly interconnected._