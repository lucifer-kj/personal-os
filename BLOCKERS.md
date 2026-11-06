# Personal OS — Blockers & Risk Log

## Active Blockers
*None currently.*

## Resolved Items
1. **Repository state on init:** Project initialized cleanly with Next.js 16 + React 19 + Tailwind v4 + TypeScript strict mode + pnpm + Vitest.
2. **Next.js 16 cookies context in unit tests:** `src/lib/supabase/server.ts` safely handles calls to `cookies()` outside request scope during standalone unit test execution, falling back cleanly to the test/development repository.
3. **M1 Task Management completed:** Full end-to-end slice implemented (migration, RLS, domain service, REST API, UI components, tests, build, and browser verification).

## Monitored Risks
1. **Supabase Local Testing:** In CI or local development without live Supabase credentials, the application operates deterministically using the repository pattern.
