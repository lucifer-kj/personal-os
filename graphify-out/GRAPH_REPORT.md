# Graph Report - productivity_os_architecture_analysis  (2026-11-18)

## Corpus Check
- 386 files · ~187,423 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 25 file(s) not represented in the graph (top: .xml 12, (none) 5, .properties 2)

## Summary
- 2373 nodes · 7018 edges · 116 communities (103 shown, 13 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 254 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cbda50e4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- getRequestContext
- HabitService
- CalendarEvent
- JournalEntry
- PageShell
- RadarItem
- apiSuccess
- errors.ts
- focus.repository.ts
- search.repository.ts
- events/[id]/route.ts
- CalendarView.tsx
- react
- cn
- lucide-react
- devDependencies
- project.repository.ts
- dependencies
- @supabase/supabase-js
- compilerOptions
- Personal OS --- Supabase Database Architecture & Specification
- @testing-library/react
- CallReceiver.java
- with
- ProjectService
- notes/schemas.ts
- studio/schemas.ts
- createClient
- DashboardHeader.tsx
- next
- scripts
- response.ts
- createProjectService
- session-policy.ts
- ResizeObserver
- InfrastructureError
- tasks/schemas.ts
- 3. Creative Thinking & Actionable Solutions
- Personal OS — Frontend Pages & Experience Specification
- allowBuilds
- task.repository.ts
- createClient
- FocusView.tsx
- Personal OS — Master System Design & Agent Development Specification
- Personal OS — Design System (`design.md`)
- 9.3 Table contracts
- Sidebar.tsx
- vitest
- note.repository.ts
- passkeys.ts
- 11.3 API endpoint inventory
- Personal OS — Production Design System Specification
- Personal OS — Backend Architecture & API Specification
- 5. Feature Domain Specifications
- 5. API endpoint inventory
- CalendarService
- 10. Security Architecture
- Personal OS — Production Engineering & Agent Direction
- InMemoryLeadRepository
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
- ILeadRepository
- api-tokens.ts
- 11. Search and vector retrieval
- 6. Dependency and library selection policy
- 1. Purpose and Scope
- 20. Triggers and Database Functions
- 8.5 Knowledge graph tables
- 17. Database Integrity and Ownership Rules
- MILESTONE_TRACKER.md
- leads/types.ts
- package.json
- Lead
- LeadQueryQueue
- LeadNiche
- LeadLocation
- ExampleInstrumentedTest.java
- posts/[id]/route.ts
- ProjectWithStats
- lead.repository.ts
- Personal OS
- Personal OS — Project Status
- eslint.config.mjs
- @vitejs/plugin-react

## God Nodes (most connected - your core abstractions)
1. `apiSuccess()` - 154 edges
2. `next` - 135 edges
3. `react` - 117 edges
4. `createClient()` - 117 edges
5. `getAuthenticatedUser()` - 111 edges
6. `apiError()` - 97 edges
7. `Button` - 92 edges
8. `vitest` - 85 edges
9. `getRequestContext()` - 80 edges
10. `lucide-react` - 74 edges

## Surprising Connections (you probably didn't know these)
- `17. Unconstrained Tablet Viewport Stretching (`MobileFocusedDashboard.tsx` at 768px)` --references--> `MobileFocusedDashboard()`  [INFERRED]
  docs/ui-ux-audit/AUDIT_REPORT.md → src/components/dashboard/MobileFocusedDashboard.tsx
- `8. Hydration Mismatch in QuickIngestBar (`QuickIngestBar.tsx` line 48)` --references--> `useSpeechToText()`  [INFERRED]
  docs/ui-ux-audit/AUDIT_REPORT.md → src/lib/hooks/useSpeechToText.ts
- `Architecture Decisions Record (ADR) Summary` --references--> `AppOrb()`  [INFERRED]
  docs/progress/PROJECT_STATUS.md → src/components/brand/AppOrb.tsx
- `Core Workstation Modules` --references--> `AppOrb()`  [INFERRED]
  README.md → src/components/brand/AppOrb.tsx
- `Architecture Decisions Record (ADR) Summary` --references--> `DynamicScenery()`  [INFERRED]
  docs/progress/PROJECT_STATUS.md → src/components/dashboard/DynamicScenery.tsx

## Import Cycles
- None detected.

## Communities (116 total, 13 thin omitted)

### Community 0 - "getRequestContext"
Cohesion: 0.11
Nodes (26): GET(), POST(), GET(), POST(), mockSelect, mockSessions, mockUpdate, GET() (+18 more)

### Community 1 - "HabitService"
Cohesion: 0.07
Nodes (30): POST(), POST(), DELETE(), GET(), PATCH(), GET(), POST(), HabitsContent() (+22 more)

### Community 2 - "CalendarEvent"
Cohesion: 0.12
Nodes (14): AgendaViewProps, CalendarViewProps, EventModalProps, MonthViewProps, WeekViewProps, globalInMemoryCalendarRepo, InMemoryCalendarRepository, SupabaseCalendarRepository (+6 more)

### Community 3 - "JournalEntry"
Cohesion: 0.07
Nodes (34): date-fns, DELETE(), GET(), PATCH(), GET(), POST(), GET(), JournalContent() (+26 more)

### Community 4 - "PageShell"
Cohesion: 0.06
Nodes (36): LeadsPage(), metadata, DashboardContent(), HomePage(), metadata, metadata, ProjectsPage(), metadata (+28 more)

### Community 5 - "RadarItem"
Cohesion: 0.07
Nodes (17): RadarArticleSheetProps, CleanArticleData, RadarFloatingReaderModal(), RadarFloatingReaderModalProps, CleanArticleContent(), RadarView(), RadarViewProps, InMemoryRadarRepository (+9 more)

### Community 6 - "apiSuccess"
Cohesion: 0.09
Nodes (51): GET(), POST(), GET(), POST(), PATCH(), GET(), POST(), GET() (+43 more)

### Community 7 - "errors.ts"
Cohesion: 0.06
Nodes (39): POST(), DELETE(), GET(), PATCH(), GET(), POST(), InboxContent(), InboxPage() (+31 more)

### Community 8 - "focus.repository.ts"
Cohesion: 0.09
Nodes (13): FocusViewProps, globalInMemoryFocusRepo, InMemoryFocusRepository, SupabaseFocusRepository, ActiveFocusSession, CompleteFocusSessionDTO, EntryType, FocusSession (+5 more)

### Community 9 - "search.repository.ts"
Cohesion: 0.13
Nodes (17): GET(), CommandPaletteProps, SearchQueryInput, SearchQuerySchema, SearchResultTypeEnum, getSearchRepository(), InMemorySearchRepository, ISearchRepository (+9 more)

### Community 10 - "events/[id]/route.ts"
Cohesion: 0.19
Nodes (15): zod, GET(), DELETE(), GET(), scheduleTaskSchema, getCalendarRepository(), calendarQuerySchema, conflictQuerySchema (+7 more)

### Community 11 - "CalendarView.tsx"
Cohesion: 0.16
Nodes (29): CalendarContent(), CalendarPage(), metadata, AgendaView(), CalendarHeader(), CalendarHeaderProps, CalendarView(), DayView() (+21 more)

### Community 12 - "react"
Cohesion: 0.09
Nodes (39): react, sonner, InboxList(), InboxView(), QuickCaptureModal(), QuickCaptureModalProps, CreateLeadModal(), CreateLeadModalProps (+31 more)

### Community 13 - "cn"
Cohesion: 0.12
Nodes (26): HabitCard(), colorOptions, HabitModal(), HabitModalProps, HabitsView(), HabitsViewProps, mockHabits, mockStats (+18 more)

### Community 14 - "lucide-react"
Cohesion: 0.17
Nodes (20): lucide-react, ActiveProjectsWidget(), CurrentFocusCard(), CurrentFocusCardProps, SubtaskItem, DashboardMetrics(), DashboardView(), FocusTimerWidget() (+12 more)

### Community 15 - "devDependencies"
Cohesion: 0.09
Nodes (22): config, devDependencies, @capacitor/cli@^8.6.0, jsdom@^31.0.0, tailwindcss@^4, @tailwindcss/turbopack@^4, @testing-library/react@^16.3.3, @types/canvas-confetti@^1.9.0 (+14 more)

### Community 16 - "project.repository.ts"
Cohesion: 0.12
Nodes (12): NotesViewProps, ProjectCreateDialogProps, getInMemoryDayRepository(), getInMemoryProjectRepository(), globalInMemoryProjectRepo, InMemoryProjectRepository, CreateProjectDTO, Project (+4 more)

### Community 17 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, canvas-confetti@^1.9.4, @capacitor/app@^8.1.2, @capacitor/core@^8.6.0, clsx@^2.1.1, date-fns@^4.4.0, lucide-react@^1.69.0, next@16.4.5 (+16 more)

### Community 18 - "@supabase/supabase-js"
Cohesion: 0.11
Nodes (16): @supabase/supabase-js, BatchTaskInput, POST(), createDashboardService(), DashboardService, getDayRepository(), globalInMemoryDayRepo, IDayRepository (+8 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "Personal OS --- Supabase Database Architecture & Specification"
Cohesion: 0.03
Nodes (59): 10.1 `inbox_items`, 10. Inbox and Quick Capture, 11.1 `daily_reports`, 11. Reports and Analytics, 12.1 Architecture principles, 12.2 `ai_memories`, 12.3 `document_chunks`, 12.4 Search strategy (+51 more)

### Community 21 - "@testing-library/react"
Cohesion: 0.07
Nodes (36): 3. Core Module Map, 6. Missing Quick Capture Trigger in Mobile Dock (`MobileNav.tsx`), @testing-library/react, inter, jetbrainsMono, metadata, newsreader, RootLayout() (+28 more)

### Community 22 - "CallReceiver.java"
Cohesion: 0.10
Nodes (4): MainActivity, CallReceiver, QuickCaptureTileService, PersonalOSWidgetProvider

### Community 23 - "with"
Cohesion: 0.06
Nodes (30): name, runs-on, steps, default, description, options, required, type (+22 more)

### Community 24 - "ProjectService"
Cohesion: 0.13
Nodes (5): IProjectRepository, SupabaseProjectRepository, ProjectService, CreateMilestoneDTO, ProjectMilestone

### Community 26 - "notes/schemas.ts"
Cohesion: 0.14
Nodes (15): abandonFocusSessionSchema, completeFocusSessionSchema, sessionModeSchema, sessionStatusSchema, startFocusSessionSchema, contentFormatSchema, CreateNoteInput, CreateNoteLinkInput (+7 more)

### Community 27 - "studio/schemas.ts"
Cohesion: 0.22
Nodes (9): CreateSocialPostInput, CreateSocialPostSchema, MediaTypeEnum, PlatformTypeEnum, PostFilterInput, PostFilterSchema, PostStatusEnum, UpdateSocialPostInput (+1 more)

### Community 28 - "createClient"
Cohesion: 0.15
Nodes (39): POST(), PATCH(), POST(), PATCH(), POST(), POST(), POST(), POST() (+31 more)

### Community 29 - "DashboardHeader.tsx"
Cohesion: 0.27
Nodes (8): DashboardHeader(), DashboardHeaderProps, DynamicScenery(), DynamicSceneryProps, getTimeOfDay(), SceneryAsset, sceneryMap, TimeOfDay

### Community 30 - "next"
Cohesion: 0.09
Nodes (27): nextConfig, next, POST(), POST(), DELETE(), RouteParams, GET(), POST() (+19 more)

### Community 31 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:watch, typecheck

### Community 32 - "response.ts"
Cohesion: 0.12
Nodes (15): GET(), GET(), CleanArticleResponse, extractTextFromHtml(), GET(), ApiErrorDetail, ApiErrorEnvelope, ApiResponseMeta (+7 more)

### Community 33 - "createProjectService"
Cohesion: 0.12
Nodes (24): DELETE(), PATCH(), RouteParams, GET(), POST(), RouteParams, DELETE(), GET() (+16 more)

### Community 34 - "session-policy.ts"
Cohesion: 0.16
Nodes (28): DELETE(), GET(), POST(), DeviceInfo, getBrowserName(), getDeviceType(), getOsName(), parseUserAgent() (+20 more)

### Community 35 - "ResizeObserver"
Cohesion: 0.29
Nodes (3): @testing-library/jest-dom@^7.0.1, @testing-library/jest-dom, ResizeObserver

### Community 36 - "InfrastructureError"
Cohesion: 0.14
Nodes (3): InfrastructureError, getLeadRepository(), SupabaseLeadRepository

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

### Community 41 - "task.repository.ts"
Cohesion: 0.11
Nodes (12): TimeBlockDrawerProps, TodayAgendaProps, globalInMemoryRepo, InMemoryTaskRepository, ITaskRepository, SupabaseTaskRepository, TaskService, CreateTaskDTO (+4 more)

### Community 42 - "createClient"
Cohesion: 0.12
Nodes (31): RFC-6238, ForgotPasswordPage(), LoginPage(), mockGetAuthenticatorAssuranceLevel, mockListFactors, mockPush, mockRefresh, mockSignInWithPassword (+23 more)

### Community 44 - "FocusView.tsx"
Cohesion: 0.15
Nodes (10): OrbState, ParsedLineItem, parseDocketLine(), PlanMyDayModal(), PlanMyDayModalProps, FocusView(), StatePreviewModalProps, startAmbientNoise() (+2 more)

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

### Community 49 - "vitest"
Cohesion: 0.17
Nodes (17): vitest, MobileFocusedDashboard(), QuickIngestBar(), QuickIngestBarProps, ISpeechRecognitionEvent, ISpeechRecognitionResult, IWindowSpeechRecognition, SpeechRecognitionConstructor (+9 more)

### Community 50 - "note.repository.ts"
Cohesion: 0.07
Nodes (20): MarkdownPreview(), NoteEditor(), NoteEditorProps, NoteCard(), NoteSidebar(), NoteSidebarProps, NotesView(), globalInMemoryNoteRepo (+12 more)

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

### Community 57 - "CalendarService"
Cohesion: 0.19
Nodes (5): GET(), POST(), CalendarService, ConflictAdvisory, ICalendarRepository

### Community 58 - "10. Security Architecture"
Cohesion: 0.18
Nodes (11): 10.10 Production security gates, 10.1 Threats, 10.2 Authentication, 10.3 Authorization, 10.4 Supabase client boundaries, 10.5 API boundary, 10.6 Storage security, 10.7 AI security (later phases) (+3 more)

### Community 59 - "Personal OS — Production Engineering & Agent Direction"
Cohesion: 0.18
Nodes (10): 10. AI and agent behavior rules, 11. Security, privacy, and data integrity, 12. Performance and reliability, 13. Documentation and Graphify context discipline, 14. Definition of Done (per spec), 15. Required completion report format, 16. Master instruction for Antigravity agents, 1. Mission and non-negotiable product direction (+2 more)

### Community 60 - "InMemoryLeadRepository"
Cohesion: 0.15
Nodes (3): InMemoryLeadRepository, LeadActivity, LeadEngineLog

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

### Community 86 - "ILeadRepository"
Cohesion: 0.15
Nodes (4): ILeadRepository, LeadService, BatchIngestLeadsDTO, LeadEngineStats

### Community 87 - "api-tokens.ts"
Cohesion: 0.24
Nodes (7): API_TOKEN_PREFIX, extractBearerToken(), generateApiTokenPair(), hashApiToken(), validateApiToken(), ValidatedToken, MockSpeechRecognition

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

### Community 95 - "leads/types.ts"
Cohesion: 0.16
Nodes (9): ContactAuthority, CreateLeadCoveragePlanDTO, EmailReachability, EngineStatus, LeadActivityType, LeadCoveragePlan, LeadSource, ScoreTier (+1 more)

### Community 96 - "package.json"
Cohesion: 0.12
Nodes (16): @capacitor/android@^8.6.0, @capacitor/haptics@^8.0.2, @capacitor/status-bar@^8.0.4, cmdk@^1.1.1, tailwind-merge@^3.7.0, thinking-orbs@^0.3.2, name, packageManager (+8 more)

### Community 97 - "Lead"
Cohesion: 0.23
Nodes (4): CreateLeadDTO, Lead, LeadFilter, UpdateLeadDTO

### Community 98 - "LeadQueryQueue"
Cohesion: 0.19
Nodes (3): CreateLeadQueryQueueDTO, LeadQueryQueue, UpdateLeadQueryQueueDTO

### Community 99 - "LeadNiche"
Cohesion: 0.26
Nodes (3): CreateLeadNicheDTO, LeadNiche, UpdateLeadNicheDTO

### Community 100 - "LeadLocation"
Cohesion: 0.27
Nodes (3): CreateLeadLocationDTO, LeadLocation, UpdateLeadLocationDTO

### Community 102 - "posts/[id]/route.ts"
Cohesion: 0.38
Nodes (8): DELETE(), GET(), PATCH(), RouteParams, GET(), POST(), getInMemorySocialPostRepository(), getSocialStudioService()

### Community 103 - "ProjectWithStats"
Cohesion: 0.20
Nodes (10): ActiveProjectsWidgetProps, DashboardMetricsProps, DashboardViewProps, MobileFocusedDashboardProps, ProjectCardProps, ProjectDetailViewProps, ProjectListProps, DashboardMetrics (+2 more)

### Community 104 - "lead.repository.ts"
Cohesion: 0.33
Nodes (4): getInMemoryLeadRepository(), globalInMemoryLeadRepo, ConvertLeadDTO, ConvertLeadResult

### Community 105 - "Personal OS"
Cohesion: 0.29
Nodes (6): Architecture & System Overview, Core Workstation Modules, Local Development, Personal OS, Structural Knowledge Graph, Technology Stack

### Community 106 - "Personal OS — Project Status"
Cohesion: 0.33
Nodes (5): Architecture Decisions Record (ADR) Summary, Key Verification Status, Milestones Summary, Overview, Personal OS — Project Status

### Community 107 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.5, eslint, eslint-config-next

## Knowledge Gaps
- **1 isolated node(s):** `RFC-6238`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 761 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `getRequestContext`, `HabitService`, `JournalEntry`, `PageShell`, `RadarItem`, `apiSuccess`, `errors.ts`, `search.repository.ts`, `events/[id]/route.ts`, `CalendarView.tsx`, `react`, `cn`, `lucide-react`, `project.repository.ts`, `dependencies`, `@supabase/supabase-js`, `@testing-library/react`, `createClient`, `DashboardHeader.tsx`, `response.ts`, `createProjectService`, `session-policy.ts`, `createClient`, `FocusView.tsx`, `Sidebar.tsx`, `vitest`, `package.json`, `posts/[id]/route.ts`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **What connects `RFC-6238` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getRequestContext` be split into smaller, more focused modules?**
  _Cohesion score 0.10685249709639953 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `HabitService`, `CalendarEvent`, `JournalEntry`, `PageShell`, `RadarItem`, `errors.ts`, `search.repository.ts`, `CalendarView.tsx`, `cn`, `lucide-react`, `dependencies`, `@testing-library/react`, `createClient`, `DashboardHeader.tsx`, `next`, `createProjectService`, `createClient`, `FocusView.tsx`, `Sidebar.tsx`, `vitest`, `note.repository.ts`, `passkeys.ts`, `package.json`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `HabitService` be split into smaller, more focused modules?**
  _Cohesion score 0.06526610644257703 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `getRequestContext`, `HabitService`, `CalendarEvent`, `JournalEntry`, `PageShell`, `RadarItem`, `apiSuccess`, `errors.ts`, `focus.repository.ts`, `search.repository.ts`, `events/[id]/route.ts`, `CalendarView.tsx`, `react`, `cn`, `devDependencies`, `project.repository.ts`, `@supabase/supabase-js`, `@testing-library/react`, `notes/schemas.ts`, `studio/schemas.ts`, `createClient`, `DashboardHeader.tsx`, `next`, `response.ts`, `createProjectService`, `session-policy.ts`, `tasks/schemas.ts`, `task.repository.ts`, `createClient`, `FocusView.tsx`, `note.repository.ts`, `passkeys.ts`, `api-tokens.ts`, `package.json`, `posts/[id]/route.ts`, `lead.repository.ts`, `@vitejs/plugin-react`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `CalendarEvent` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._