# Personal OS — Blockers & Risk Log

## Active Blockers
*None currently.*

## Resolved Items
1. **Repository state on init:** The repository contained specs, design tokens, and screenshot assets without Git. Initialized Next.js 16 + React 19 + Tailwind v4 project structure cleanly and integrated with Git.
2. **Tailwind v4 compatibility:** The repository provided an `index.css` crafted for Tailwind v4 `@theme inline`. Successfully matched with `@tailwindcss/turbopack` and `tailwindcss` 4.3.4.

## Monitored Risks
1. **Supabase Local Testing:** In CI or local development without live Supabase credentials, the application must not crash on build or test runs. A mock/fallback client configuration ensures 100% deterministic local builds and test execution.
2. **React 19 Ecosystem Compatibility:** Ensuring testing libraries (`@testing-library/react`) operate seamlessly with React 19.
