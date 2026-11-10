-- ============================================================================
-- Migration: 0014_leads_and_crm.sql
-- Description: Leads, Lead Activities, Scoped API Tokens, and Full-Text Search
-- Conforms to: Personal OS Single-User Enclave & CRM Architecture
-- ============================================================================

-- 1. Scoped API Tokens Table (For n8n, Mobile APK, and External Scrapers)
CREATE TABLE IF NOT EXISTS public.api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    token_prefix TEXT NOT NULL, -- e.g. "pos_live_"
    scopes TEXT[] NOT NULL DEFAULT '{"read", "write"}',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON public.api_tokens(token_hash) WHERE revoked_at IS NULL;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'api_tokens' AND policyname = 'Enforce user ownership on api_tokens'
    ) THEN
        CREATE POLICY "Enforce user ownership on api_tokens"
            ON public.api_tokens FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 2. CRM Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'lead' 
        CHECK (status IN ('lead', 'contacted', 'qualified', 'converted', 'lost')),
    source TEXT NOT NULL DEFAULT 'manual' 
        CHECK (source IN ('apollo', 'hunter', 'linkedin', 'website', 'inbound_email', 'referral', 'manual', 'n8n_scraper')),
    first_name TEXT,
    last_name TEXT,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    website TEXT,
    linkedin_url TEXT,
    location TEXT,
    score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    estimated_value_cents BIGINT NOT NULL DEFAULT 0,
    enrichment_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    converted_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    last_contacted_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_leads_user_email UNIQUE (user_id, email)
);

CREATE INDEX IF NOT EXISTS idx_leads_user_status ON public.leads(user_id, status) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_user_score ON public.leads(user_id, score DESC) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_user_company ON public.leads(user_id, company);
CREATE INDEX IF NOT EXISTS idx_leads_user_created ON public.leads(user_id, created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Enforce user ownership on leads'
    ) THEN
        CREATE POLICY "Enforce user ownership on leads"
            ON public.leads FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Lead Activities Table (Interaction History)
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL 
        CHECK (activity_type IN ('email_sent', 'email_received', 'call', 'meeting', 'note_added', 'status_changed', 'enrichment', 'n8n_trigger')),
    summary TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id, created_at DESC);
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'lead_activities' AND policyname = 'Enforce user ownership on lead_activities'
    ) THEN
        CREATE POLICY "Enforce user ownership on lead_activities"
            ON public.lead_activities FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Full-Text Search on Leads (FTS Integration)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', 
            coalesce(full_name, '') || ' ' || 
            coalesce(company, '') || ' ' || 
            coalesce(email, '') || ' ' || 
            coalesce(job_title, '') || ' ' || 
            coalesce(notes, '')
        )
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_leads_fts ON public.leads USING GIN (fts);

-- 5. Atomic Conversion RPC: Convert Lead to Active Project & Discovery Task
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
        due_date,
        source_type,
        source_id
    ) VALUES (
        p_user_id,
        v_project_id,
        'Client Discovery & Kickoff: ' || v_lead.full_name,
        'Lead converted to active client project. Conduct discovery call and scope review.',
        'urgent',
        'todo',
        CURRENT_DATE + INTERVAL '2 days',
        'automation',
        p_lead_id
    ) RETURNING id INTO v_task_id;

    -- Update Lead
    UPDATE public.leads
    SET status = 'converted',
        converted_project_id = v_project_id,
        converted_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_lead_id;

    -- Log Activity
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
        'Lead converted to Client Project',
        jsonb_build_object('project_id', v_project_id, 'task_id', v_task_id)
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
