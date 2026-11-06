-- ============================================================================
-- Migration: 0005_inbox_items.sql
-- Description: Inbox and quick capture schema with Row-Level Security
-- Conforms to: docs/knowledge/PERSONAL_OS_SUPABASE_DATABASE_SPEC.md (Section 10.1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inbox_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    capture_type TEXT NOT NULL DEFAULT 'idea' CHECK (capture_type IN ('task', 'note', 'idea', 'link', 'reminder', 'other')),
    status TEXT NOT NULL DEFAULT 'unprocessed' CHECK (status IN ('unprocessed', 'processed', 'dismissed')),
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'widget', 'extension', 'ai', 'integration')),
    url TEXT,
    converted_entity_type TEXT CHECK (converted_entity_type IS NULL OR converted_entity_type IN ('task', 'note', 'project', 'event')),
    converted_entity_id UUID,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for inbox queries
CREATE INDEX IF NOT EXISTS idx_inbox_items_user_status ON public.inbox_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_inbox_items_user_created ON public.inbox_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_items_capture_type ON public.inbox_items(user_id, capture_type);

-- Row-Level Security (RLS)
ALTER TABLE public.inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inbox items"
    ON public.inbox_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inbox items"
    ON public.inbox_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inbox items"
    ON public.inbox_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inbox items"
    ON public.inbox_items FOR DELETE
    USING (auth.uid() = user_id);
