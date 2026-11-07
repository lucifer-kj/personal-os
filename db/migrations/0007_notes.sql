-- ============================================================================
-- Migration: 0007_notes.sql
-- Description: Notes and Note Links schema with Row-Level Security
-- Conforms to: docs/knowledge/PERSONAL_OS_SUPABASE_DATABASE_SPEC.md (Sections 8.1 & 8.2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT DEFAULT '',
    content_format TEXT NOT NULL DEFAULT 'markdown' CHECK (content_format IN ('markdown', 'plain_text', 'tiptap_json')),
    note_type TEXT NOT NULL DEFAULT 'standard' CHECK (note_type IN ('standard', 'meeting', 'concept', 'project', 'reference')),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Note Links (relations between notes)
CREATE TABLE IF NOT EXISTS public.note_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    target_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    link_type TEXT NOT NULL DEFAULT 'related' CHECK (link_type IN ('related', 'references', 'derived_from')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_note_links_no_self_link CHECK (source_note_id <> target_note_id),
    CONSTRAINT uq_note_links_source_target UNIQUE (source_note_id, target_note_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON public.notes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_project ON public.notes(user_id, project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_user_task ON public.notes(user_id, task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_note_links_user ON public.note_links(user_id);
CREATE INDEX IF NOT EXISTS idx_note_links_source ON public.note_links(source_note_id);
CREATE INDEX IF NOT EXISTS idx_note_links_target ON public.note_links(target_note_id);

-- Row-Level Security (RLS) for notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
    ON public.notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
    ON public.notes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
    ON public.notes FOR DELETE
    USING (auth.uid() = user_id);

-- Row-Level Security (RLS) for note_links
ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own note links"
    ON public.note_links FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own note links"
    ON public.note_links FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own note links"
    ON public.note_links FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own note links"
    ON public.note_links FOR DELETE
    USING (auth.uid() = user_id);
