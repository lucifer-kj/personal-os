-- ============================================================================
-- Migration: 0011_auth_sessions.sql
-- Description: Device and session management registry with Row-Level Security
-- Conforms to: Personal OS Security Hardening (Milestone 9)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE,
    device_name TEXT NOT NULL,
    browser TEXT NOT NULL,
    os TEXT NOT NULL,
    ip_address TEXT,
    is_trusted BOOLEAN NOT NULL DEFAULT false,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON public.auth_sessions(user_id, revoked_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_lookup ON public.auth_sessions(session_id);

ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'auth_sessions' AND policyname = 'Users can view their own sessions'
    ) THEN
        CREATE POLICY "Users can view their own sessions"
            ON public.auth_sessions FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'auth_sessions' AND policyname = 'Users can insert their own sessions'
    ) THEN
        CREATE POLICY "Users can insert their own sessions"
            ON public.auth_sessions FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'auth_sessions' AND policyname = 'Users can update their own sessions'
    ) THEN
        CREATE POLICY "Users can update their own sessions"
            ON public.auth_sessions FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'auth_sessions' AND policyname = 'Users can delete their own sessions'
    ) THEN
        CREATE POLICY "Users can delete their own sessions"
            ON public.auth_sessions FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;
