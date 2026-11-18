-- ============================================================================
-- Migration: 0017_outbox_events_and_lead_upsert.sql
-- Description: Transactional Outbox Event Hub and Atomic Lead Upsert Procedure
-- Resolves: Fire-and-forget webhook failures, duplicate race conditions, case mismatch collisions
-- ============================================================================

-- 1. Create Transactional Outbox Table
CREATE TABLE IF NOT EXISTS public.outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    idempotency_key TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'failed')),
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 5,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_events_pending 
    ON public.outbox_events (status, created_at) 
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_outbox_events_user 
    ON public.outbox_events (user_id, created_at DESC);

ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own outbox events"
    ON public.outbox_events
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role has full access to outbox events"
    ON public.outbox_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 2. Atomic Lead Upsert RPC with Embedded Transactional Outbox Event
CREATE OR REPLACE FUNCTION public.upsert_inbound_lead(
    p_user_id UUID,
    p_lead JSONB,
    p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email TEXT;
    v_score INT := 20;
    v_lead_id UUID;
    v_is_inserted BOOLEAN;
    v_full_name TEXT;
    v_job_title TEXT;
    v_company TEXT;
    v_phone TEXT;
    v_linkedin_url TEXT;
    v_source TEXT;
BEGIN
    -- Authorization Guard
    IF auth.role() <> 'service_role' AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
        RAISE EXCEPTION 'Access denied: Caller % is not authorized to act on behalf of user %', auth.uid(), p_user_id;
    END IF;

    -- Extract & normalize required fields
    v_full_name := trim(p_lead->>'full_name');
    v_email := lower(trim(p_lead->>'email'));
    v_company := nullif(trim(p_lead->>'company'), '');
    v_phone := nullif(trim(p_lead->>'phone'), '');
    v_job_title := nullif(trim(p_lead->>'job_title'), '');
    v_linkedin_url := nullif(trim(p_lead->>'linkedin_url'), '');
    v_source := coalesce(nullif(trim(p_lead->>'source'), ''), 'apollo');

    IF v_email IS NULL OR v_email = '' THEN
        RAISE EXCEPTION 'Email is required for inbound lead ingestion';
    END IF;

    -- Calculate dynamic score
    IF v_company IS NOT NULL THEN v_score := v_score + 25; END IF;
    IF v_phone IS NOT NULL THEN v_score := v_score + 20; END IF;
    IF v_linkedin_url IS NOT NULL THEN v_score := v_score + 15; END IF;
    IF v_job_title ~* '(founder|ceo|director|head|vp|owner|partner|principal)' THEN
        v_score := v_score + 20;
    END IF;
    v_score := least(100, v_score);

    -- Atomic Upsert with conflict resolution on (user_id, email)
    INSERT INTO public.leads (
        user_id,
        full_name,
        first_name,
        last_name,
        email,
        phone,
        company,
        job_title,
        website,
        linkedin_url,
        location,
        source,
        score,
        estimated_value_cents,
        enrichment_data,
        notes,
        status
    ) VALUES (
        p_user_id,
        v_full_name,
        coalesce(nullif(trim(p_lead->>'first_name'), ''), split_part(v_full_name, ' ', 1)),
        coalesce(nullif(trim(p_lead->>'last_name'), ''), nullif(trim(substr(v_full_name, length(split_part(v_full_name, ' ', 1)) + 1)), '')),
        v_email,
        v_phone,
        v_company,
        v_job_title,
        nullif(trim(p_lead->>'website'), ''),
        v_linkedin_url,
        nullif(trim(p_lead->>'location'), ''),
        v_source,
        v_score,
        coalesce((p_lead->>'estimated_value_cents')::bigint, 0),
        coalesce(p_lead->'enrichment_data', '{}'::jsonb),
        nullif(trim(p_lead->>'notes'), ''),
        'lead'
    )
    ON CONFLICT (user_id, email) DO UPDATE SET
        full_name = coalesce(nullif(trim(excluded.full_name), ''), leads.full_name),
        phone = coalesce(excluded.phone, leads.phone),
        company = coalesce(excluded.company, leads.company),
        job_title = coalesce(excluded.job_title, leads.job_title),
        website = coalesce(excluded.website, leads.website),
        linkedin_url = coalesce(excluded.linkedin_url, leads.linkedin_url),
        location = coalesce(excluded.location, leads.location),
        score = v_score,
        enrichment_data = leads.enrichment_data || coalesce(excluded.enrichment_data, '{}'::jsonb) || jsonb_build_object('last_enriched_at', NOW()),
        notes = coalesce(excluded.notes, leads.notes),
        updated_at = NOW()
    RETURNING id, (xmax = 0) INTO v_lead_id, v_is_inserted;

    -- Enqueue Outbox Event within same transaction
    INSERT INTO public.outbox_events (
        user_id,
        event_type,
        aggregate_type,
        aggregate_id,
        payload,
        idempotency_key
    ) VALUES (
        p_user_id,
        CASE WHEN v_is_inserted THEN 'lead.created' ELSE 'lead.updated' END,
        'lead',
        v_lead_id,
        jsonb_build_object(
            'lead_id', v_lead_id,
            'email', v_email,
            'full_name', v_full_name,
            'score', v_score,
            'source', v_source,
            'is_new', v_is_inserted
        ),
        p_idempotency_key
    )
    ON CONFLICT (idempotency_key) DO NOTHING;

    -- Record Audit Activity
    INSERT INTO public.lead_activities (
        user_id,
        lead_id,
        activity_type,
        summary,
        details
    ) VALUES (
        p_user_id,
        v_lead_id,
        'enrichment',
        CASE WHEN v_is_inserted THEN 'Lead created via atomic upsert' ELSE 'Lead updated & enriched via atomic upsert' END,
        jsonb_build_object('source', v_source, 'score', v_score, 'is_new', v_is_inserted)
    );

    RETURN jsonb_build_object(
        'success', true,
        'action', CASE WHEN v_is_inserted THEN 'created' ELSE 'updated' END,
        'lead_id', v_lead_id,
        'score', v_score
    );
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_inbound_lead(UUID, JSONB, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_inbound_lead(UUID, JSONB, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_inbound_lead(UUID, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_inbound_lead(UUID, JSONB, TEXT) TO service_role;
