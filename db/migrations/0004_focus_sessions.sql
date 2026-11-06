-- ============================================================================
-- Migration: 0004_focus_sessions.sql
-- Description: Focus sessions and time entries schema with Row-Level Security
-- Conforms to: docs/knowledge/PERSONAL_OS_SUPABASE_DATABASE_SPEC.md (Sections 7.4 & 7.5)
-- ============================================================================

-- 1. Create time_entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    description TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    entry_type TEXT NOT NULL DEFAULT 'focus' CHECK (entry_type IN ('focus', 'manual', 'break', 'meeting')),
    is_billable BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Partial unique index: at most one active running timer per user (ended_at IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_time_entries_user_active_timer 
ON public.time_entries (user_id) 
WHERE ended_at IS NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_user_started ON public.time_entries(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON public.time_entries(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries(project_id) WHERE project_id IS NOT NULL;

-- 2. Create focus_sessions table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    time_entry_id UUID NOT NULL UNIQUE REFERENCES public.time_entries(id) ON DELETE CASCADE,
    session_mode TEXT NOT NULL DEFAULT 'deep_work' CHECK (session_mode IN ('deep_work', 'pomodoro', 'short_break', 'long_break', 'custom')),
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'abandoned')),
    planned_duration_seconds INTEGER CHECK (planned_duration_seconds IS NULL OR planned_duration_seconds > 0),
    paused_duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (paused_duration_seconds >= 0),
    paused_at TIMESTAMPTZ,
    interruption_count INTEGER NOT NULL DEFAULT 0 CHECK (interruption_count >= 0),
    session_rating SMALLINT CHECK (session_rating IS NULL OR (session_rating >= 1 AND session_rating <= 5)),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for focus_sessions
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_status ON public.focus_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_created ON public.focus_sessions(user_id, created_at DESC);

-- 3. Row-Level Security (RLS)
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Time Entries RLS Policies
CREATE POLICY "Users can view their own time entries"
    ON public.time_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries"
    ON public.time_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries"
    ON public.time_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries"
    ON public.time_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Focus Sessions RLS Policies
CREATE POLICY "Users can view their own focus sessions"
    ON public.focus_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus sessions"
    ON public.focus_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus sessions"
    ON public.focus_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus sessions"
    ON public.focus_sessions FOR DELETE
    USING (auth.uid() = user_id);
