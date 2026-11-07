-- ============================================================================
-- Migration: 0006_calendar_events.sql
-- Description: Calendar events schema with Row-Level Security and conflict indexing
-- Conforms to: docs/knowledge/PERSONAL_OS_SUPABASE_DATABASE_SPEC.md (Section 7.1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL DEFAULT 'personal' CHECK (event_type IN ('personal', 'focus', 'meeting', 'reminder', 'external')),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT false,
    timezone TEXT DEFAULT 'UTC',
    location TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    meeting_id UUID,
    source_provider TEXT,
    source_event_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_calendar_events_end_after_start CHECK (end_at > start_at)
);

-- Indexes for range queries and conflict detection
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_range ON public.calendar_events(user_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_type ON public.calendar_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_task ON public.calendar_events(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calendar_events_project ON public.calendar_events(project_id) WHERE project_id IS NOT NULL;

-- External event uniqueness (when synced from external providers)
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_events_external_unique 
    ON public.calendar_events(user_id, source_provider, source_event_id) 
    WHERE source_provider IS NOT NULL AND source_event_id IS NOT NULL;

-- Row-Level Security (RLS)
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar events"
    ON public.calendar_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events"
    ON public.calendar_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
    ON public.calendar_events FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
    ON public.calendar_events FOR DELETE
    USING (auth.uid() = user_id);
