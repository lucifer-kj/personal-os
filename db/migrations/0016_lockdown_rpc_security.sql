-- ============================================================================
-- Migration: 0016_lockdown_rpc_security.sql
-- Description: Strict RPC authorization guards & privilege revocation
-- Resolves: RPC anon execution vulnerability & impersonation attack vectors
-- ============================================================================

-- 1. Revoke default execution from PUBLIC and anon for all current and future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- 2. Lockdown: convert_lead_to_project_and_task
CREATE OR REPLACE FUNCTION public.convert_lead_to_project_and_task(
    p_user_id UUID,
    p_lead_id UUID,
    p_project_name TEXT DEFAULT NULL,
    p_project_description TEXT DEFAULT NULL,
    p_estimated_value_cents BIGINT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lead RECORD;
    v_project_id UUID;
    v_task_id UUID;
BEGIN
    -- Caller Authentication & Authorization Check
    IF auth.role() <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
        RAISE EXCEPTION 'Access denied: Caller % is not authorized to act on behalf of user %', auth.uid(), p_user_id;
    END IF;

    SELECT * INTO v_lead
    FROM public.leads
    WHERE id = p_lead_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead % not found or not owned by user', p_lead_id;
    END IF;

    IF v_lead.status = 'converted' AND v_lead.converted_project_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'lead_id', p_lead_id,
            'project_id', v_lead.converted_project_id,
            'already_converted', true
        );
    END IF;

    -- Create Project
    INSERT INTO public.projects (
        user_id,
        name,
        description,
        status,
        priority,
        start_date
    ) VALUES (
        p_user_id,
        coalesce(p_project_name, coalesce(v_lead.company, v_lead.full_name) || ' — Engagement'),
        coalesce(p_project_description, 'Client project converted from lead: ' || v_lead.full_name),
        'active',
        'high',
        CURRENT_DATE
    ) RETURNING id INTO v_project_id;

    -- Create Onboarding Task
    INSERT INTO public.tasks (
        user_id,
        project_id,
        title,
        description,
        priority,
        status,
        source_id,
        source_type
    ) VALUES (
        p_user_id,
        v_project_id,
        'Discovery & Kickoff: ' || v_lead.full_name,
        'Initial discovery call and scoping for newly converted client lead.',
        'high',
        'todo',
        p_lead_id,
        'lead'
    ) RETURNING id INTO v_task_id;

    -- Update Lead record
    UPDATE public.leads
    SET 
        status = 'converted',
        converted_project_id = v_project_id,
        estimated_value_cents = coalesce(p_estimated_value_cents, estimated_value_cents),
        converted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_lead_id AND user_id = p_user_id;

    -- Record Conversion Activity
    INSERT INTO public.lead_activities (
        user_id,
        lead_id,
        activity_type,
        summary,
        details
    ) VALUES (
        p_user_id,
        p_lead_id,
        'status_changed',
        'Lead converted into Active Project and Onboarding Task',
        jsonb_build_object(
            'project_id', v_project_id,
            'task_id', v_task_id,
            'previous_status', v_lead.status,
            'new_status', 'converted'
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'lead_id', p_lead_id,
        'project_id', v_project_id,
        'task_id', v_task_id,
        'already_converted', false
    );
END;
$$;

REVOKE ALL ON FUNCTION public.convert_lead_to_project_and_task(UUID, UUID, TEXT, TEXT, BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.convert_lead_to_project_and_task(UUID, UUID, TEXT, TEXT, BIGINT) FROM anon;
GRANT EXECUTE ON FUNCTION public.convert_lead_to_project_and_task(UUID, UUID, TEXT, TEXT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_lead_to_project_and_task(UUID, UUID, TEXT, TEXT, BIGINT) TO service_role;


-- 3. Lockdown: process_inbox_item_to_task
CREATE OR REPLACE FUNCTION public.process_inbox_item_to_task(
    p_user_id UUID,
    p_inbox_id UUID,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT 'medium',
    p_due_date DATE DEFAULT NULL,
    p_project_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_inbox_item RECORD;
    v_task_id UUID;
    v_updated_inbox RECORD;
BEGIN
    -- Caller Authentication & Authorization Check
    IF auth.role() <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
        RAISE EXCEPTION 'Access denied: Caller % is not authorized to act on behalf of user %', auth.uid(), p_user_id;
    END IF;

    -- 1. Lock and fetch inbox item
    SELECT * INTO v_inbox_item
    FROM public.inbox_items
    WHERE id = p_inbox_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inbox item % not found', p_inbox_id;
    END IF;

    -- Idempotent check: already processed
    IF v_inbox_item.status = 'processed' AND v_inbox_item.converted_entity_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'item', to_jsonb(v_inbox_item),
            'created_entity_id', v_inbox_item.converted_entity_id,
            'target_type', v_inbox_item.converted_entity_type,
            'idempotent', true
        );
    END IF;

    -- 2. Check for duplicate task by source_id
    SELECT id INTO v_task_id
    FROM public.tasks
    WHERE user_id = p_user_id AND source_id = p_inbox_id AND source_type = 'inbox'
    LIMIT 1;

    IF v_task_id IS NULL THEN
        -- Insert new task
        INSERT INTO public.tasks (
            user_id,
            title,
            description,
            priority,
            due_date,
            project_id,
            source_id,
            source_type,
            status
        ) VALUES (
            p_user_id,
            p_title,
            p_description,
            p_priority,
            p_due_date,
            p_project_id,
            p_inbox_id,
            'inbox',
            'todo'
        )
        RETURNING id INTO v_task_id;
    END IF;

    -- 3. Mark inbox item as processed
    UPDATE public.inbox_items
    SET 
        status = 'processed',
        converted_entity_type = 'task',
        converted_entity_id = v_task_id,
        processed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_inbox_id AND user_id = p_user_id
    RETURNING * INTO v_updated_inbox;

    RETURN jsonb_build_object(
        'item', to_jsonb(v_updated_inbox),
        'created_entity_id', v_task_id,
        'target_type', 'task',
        'idempotent', false
    );
END;
$$;

REVOKE ALL ON FUNCTION public.process_inbox_item_to_task(UUID, UUID, TEXT, TEXT, TEXT, DATE, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_inbox_item_to_task(UUID, UUID, TEXT, TEXT, TEXT, DATE, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.process_inbox_item_to_task(UUID, UUID, TEXT, TEXT, TEXT, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_inbox_item_to_task(UUID, UUID, TEXT, TEXT, TEXT, DATE, UUID) TO service_role;


-- 4. Lockdown: universal_fts_search
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
    -- Caller Authentication & Authorization Check
    IF auth.role() <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
        RAISE EXCEPTION 'Access denied: Caller % is not authorized to search for user %', auth.uid(), p_user_id;
    END IF;

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
            ('Priority: ' || t.priority)::TEXT AS subtitle,
            ts_headline('english', coalesce(t.description, ''), v_query, 'StartSel=<b>,StopSel=</b>,MaxWords=25,MinWords=10') AS snippet,
            ('/tasks?selected=' || t.id)::TEXT AS url,
            t.status::TEXT AS status,
            (ts_rank(t.fts, v_query) * 1.0)::FLOAT AS score
        FROM public.tasks t
        WHERE t.user_id = p_user_id AND t.fts @@ v_query

        UNION ALL

        -- Projects
        SELECT 
            p.id,
            'project'::TEXT AS type,
            p.name AS title,
            ('Status: ' || p.status)::TEXT AS subtitle,
            ts_headline('english', coalesce(p.description, ''), v_query, 'StartSel=<b>,StopSel=</b>,MaxWords=25,MinWords=10') AS snippet,
            ('/projects?selected=' || p.id)::TEXT AS url,
            p.status::TEXT AS status,
            (ts_rank(p.fts, v_query) * 1.1)::FLOAT AS score
        FROM public.projects p
        WHERE p.user_id = p_user_id AND p.fts @@ v_query
    )
    ORDER BY score DESC
    LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.universal_fts_search(UUID, TEXT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.universal_fts_search(UUID, TEXT, INT) FROM anon;
GRANT EXECUTE ON FUNCTION public.universal_fts_search(UUID, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.universal_fts_search(UUID, TEXT, INT) TO service_role;
