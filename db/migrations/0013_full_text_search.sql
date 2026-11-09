-- ============================================================================
-- Migration: 0013_full_text_search.sql
-- Description: Full-Text Search generated columns, GIN indexes, and rank search RPC
-- Conforms to: Personal OS Knowledge & Search Architecture (Milestone 12)
-- ============================================================================

-- Notes FTS
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS fts tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_notes_fts ON public.notes USING GIN (fts);

-- Tasks FTS
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS fts tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_tasks_fts ON public.tasks USING GIN (fts);

-- Projects FTS
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS fts tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_projects_fts ON public.projects USING GIN (fts);

-- Universal FTS Search RPC
CREATE OR REPLACE FUNCTION public.universal_fts_search(
    p_user_id UUID,
    p_query TEXT,
    p_limit INT DEFAULT 20
) RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    subtitle TEXT,
    snippet TEXT,
    url TEXT,
    status TEXT,
    score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_query tsquery;
BEGIN
    v_query := websearch_to_tsquery('english', p_query);

    RETURN QUERY
    (
        -- Notes
        SELECT 
            n.id,
            'note'::TEXT AS type,
            n.title,
            array_to_string(n.tags, ', ') AS subtitle,
            ts_headline('english', coalesce(n.content, ''), v_query, 'StartSel=<b>,StopSel=</b>,MaxWords=25,MinWords=10') AS snippet,
            ('/notes?selected=' || n.id)::TEXT AS url,
            (CASE WHEN n.is_archived THEN 'archived' ELSE 'active' END)::TEXT AS status,
            (ts_rank(n.fts, v_query) * 1.2)::FLOAT AS score
        FROM public.notes n
        WHERE n.user_id = p_user_id AND n.deleted_at IS NULL AND n.fts @@ v_query

        UNION ALL

        -- Tasks
        SELECT 
            t.id,
            'task'::TEXT AS type,
            t.title,
            t.priority::TEXT AS subtitle,
            ts_headline('english', coalesce(t.description, ''), v_query, 'StartSel=<b>,StopSel=</b>,MaxWords=25,MinWords=10') AS snippet,
            ('/tasks?selected=' || t.id)::TEXT AS url,
            t.status::TEXT AS status,
            (ts_rank(t.fts, v_query) * 1.0)::FLOAT AS score
        FROM public.tasks t
        WHERE t.user_id = p_user_id AND t.deleted_at IS NULL AND t.fts @@ v_query

        UNION ALL

        -- Projects
        SELECT 
            p.id,
            'project'::TEXT AS type,
            p.name AS title,
            p.status::TEXT AS subtitle,
            ts_headline('english', coalesce(p.description, ''), v_query, 'StartSel=<b>,StopSel=</b>,MaxWords=25,MinWords=10') AS snippet,
            ('/projects/' || p.id)::TEXT AS url,
            p.status::TEXT AS status,
            (ts_rank(p.fts, v_query) * 1.1)::FLOAT AS score
        FROM public.projects p
        WHERE p.user_id = p_user_id AND p.deleted_at IS NULL AND p.fts @@ v_query
    )
    ORDER BY score DESC
    LIMIT p_limit;
END;
$$;
