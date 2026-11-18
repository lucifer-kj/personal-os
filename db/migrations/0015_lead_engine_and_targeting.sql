-- ============================================================================
-- Migration: 0015_lead_engine_and_targeting.sql
-- Description: Lead Engine Autonomous Targeting, Pipeline State & Ingestion
-- Extends: 0014_leads_and_crm.sql
-- Conforms to: Personal OS Single-User Enclave Architecture
-- ============================================================================

-- 1. Niches Master Catalog (Verticals, OSM Tags & Default Pitches)
CREATE TABLE IF NOT EXISTS public.lead_niches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    vertical TEXT NOT NULL,
    osm_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    default_pitch_angle TEXT,
    avg_deal_value_cents BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lead_niches_user ON public.lead_niches(user_id, is_active);
ALTER TABLE public.lead_niches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'lead_niches' AND policyname = 'Enforce user ownership on lead_niches'
    ) THEN
        CREATE POLICY "Enforce user ownership on lead_niches"
            ON public.lead_niches FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Locations Master Catalog (Commercial Hubs, Coordinates, Search Radius)
CREATE TABLE IF NOT EXISTS public.lead_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    radius_km DECIMAL(5,2) NOT NULL DEFAULT 3.0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lead_locations_user ON public.lead_locations(user_id, status);
ALTER TABLE public.lead_locations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'lead_locations' AND policyname = 'Enforce user ownership on lead_locations'
    ) THEN
        CREATE POLICY "Enforce user ownership on lead_locations"
            ON public.lead_locations FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Coverage Plans (Niche x Location Matrix with Frequency & Cooldown)
CREATE TABLE IF NOT EXISTS public.lead_coverage_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    niche_id UUID NOT NULL REFERENCES public.lead_niches(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.lead_locations(id) ON DELETE CASCADE,
    frequency_days INTEGER NOT NULL DEFAULT 14,
    last_run_at TIMESTAMPTZ,
    next_eligible_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_coverage_plan_niche_location UNIQUE (user_id, niche_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_coverage_plans_user ON public.lead_coverage_plans(user_id, status);
ALTER TABLE public.lead_coverage_plans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'lead_coverage_plans' AND policyname = 'Enforce user ownership on lead_coverage_plans'
    ) THEN
        CREATE POLICY "Enforce user ownership on lead_coverage_plans"
            ON public.lead_coverage_plans FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Search Query Queue (Worker Dispatch Queue for n8n / Scrapers)
CREATE TABLE IF NOT EXISTS public.lead_query_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coverage_plan_id UUID REFERENCES public.lead_coverage_plans(id) ON DELETE SET NULL,
    niche_id UUID NOT NULL REFERENCES public.lead_niches(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.lead_locations(id) ON DELETE CASCADE,
    overpass_query TEXT,
    query_string TEXT,
    source TEXT NOT NULL DEFAULT 'osm',
    priority INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    leads_discovered INTEGER NOT NULL DEFAULT 0,
    leads_qualified INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    dispatched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_query_queue_dispatch ON public.lead_query_queue(user_id, status, priority DESC, created_at ASC);
ALTER TABLE public.lead_query_queue ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'lead_query_queue' AND policyname = 'Enforce user ownership on lead_query_queue'
    ) THEN
        CREATE POLICY "Enforce user ownership on lead_query_queue"
            ON public.lead_query_queue FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Lead Engine Execution Logs (Telemetry & Audit)
CREATE TABLE IF NOT EXISTS public.lead_engine_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    component TEXT NOT NULL,
    execution_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_engine_logs_user ON public.lead_engine_logs(user_id, created_at DESC);
ALTER TABLE public.lead_engine_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'lead_engine_logs' AND policyname = 'Enforce user ownership on lead_engine_logs'
    ) THEN
        CREATE POLICY "Enforce user ownership on lead_engine_logs"
            ON public.lead_engine_logs FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Extend Leads Table with Intelligence Dossier & Engine Fields
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS business_name TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS subcategory TEXT,
    ADD COLUMN IF NOT EXISTS niche_id UUID REFERENCES public.lead_niches(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.lead_locations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS dedupe_key TEXT,
    ADD COLUMN IF NOT EXISTS lighthouse_mobile INTEGER CHECK (lighthouse_mobile BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS lighthouse_desktop INTEGER CHECK (lighthouse_desktop BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS has_ssl BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS cms_detected TEXT,
    ADD COLUMN IF NOT EXISTS audit_signals TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS tech_stack_raw JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS decision_maker_name TEXT,
    ADD COLUMN IF NOT EXISTS decision_maker_title TEXT,
    ADD COLUMN IF NOT EXISTS email_reachability TEXT DEFAULT 'unknown' CHECK (email_reachability IN ('safe', 'risky', 'invalid', 'unknown')),
    ADD COLUMN IF NOT EXISTS phone_formatted TEXT,
    ADD COLUMN IF NOT EXISTS contact_authority TEXT DEFAULT 'unverified' CHECK (contact_authority IN ('owner', 'authority', 'unverified')),
    ADD COLUMN IF NOT EXISTS recommended_service TEXT,
    ADD COLUMN IF NOT EXISTS tailored_pitch TEXT,
    ADD COLUMN IF NOT EXISTS score_tier TEXT DEFAULT 'warm' CHECK (score_tier IN ('hot', 'warm', 'cold')),
    ADD COLUMN IF NOT EXISTS engine_status TEXT DEFAULT 'discovered' CHECK (engine_status IN ('discovered', 'filtered', 'enriched', 'audited', 'pitch_ready', 'verified', 'disqualified', 'error')),
    ADD COLUMN IF NOT EXISTS engine_disqualify_reason TEXT,
    ADD COLUMN IF NOT EXISTS engine_batch_id TEXT,
    ADD COLUMN IF NOT EXISTS engine_last_processed_at TIMESTAMPTZ;

-- Deduplication index for idempotent n8n crawler ingestion
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_user_dedupe_key 
    ON public.leads(user_id, dedupe_key) 
    WHERE dedupe_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_engine_status 
    ON public.leads(user_id, engine_status);

CREATE INDEX IF NOT EXISTS idx_leads_score_tier 
    ON public.leads(user_id, score_tier);

-- 7. Update Universal Full-Text Search on Leads to include new intelligence fields
ALTER TABLE public.leads DROP COLUMN IF EXISTS fts;
ALTER TABLE public.leads ADD COLUMN fts tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', 
            coalesce(full_name, '') || ' ' || 
            coalesce(business_name, '') || ' ' || 
            coalesce(category, '') || ' ' || 
            coalesce(subcategory, '') || ' ' || 
            coalesce(company, '') || ' ' || 
            coalesce(email, '') || ' ' || 
            coalesce(phone, '') || ' ' || 
            coalesce(address, '') || ' ' || 
            coalesce(tailored_pitch, '') || ' ' || 
            coalesce(notes, '')
        )
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_leads_fts ON public.leads USING GIN (fts);
