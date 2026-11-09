-- ============================================================================
-- Migration: 0012_inbox_atomic_process.sql
-- Description: Atomic, idempotent inbox processing transaction
-- Conforms to: Personal OS Architecture Hardening (Milestone 10)
-- ============================================================================

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
        INSERT INTO public.tasks (
            user_id,
            title,
            description,
            priority,
            due_date,
            project_id,
            source_type,
            source_id
        ) VALUES (
            p_user_id,
            p_title,
            p_description,
            p_priority,
            p_due_date,
            p_project_id,
            'inbox',
            p_inbox_id
        ) RETURNING id INTO v_task_id;
    END IF;

    -- 3. Mark inbox item processed atomically
    UPDATE public.inbox_items
    SET status = 'processed',
        converted_entity_type = 'task',
        converted_entity_id = v_task_id,
        processed_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
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
