-- ============================================================================
-- Migration: 0018_agent_actions.sql
-- Description: Agent Actions Audit Log for MCP and Autonomous Workflows
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL DEFAULT 'mcp_agent',
    tool_name TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    is_error BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_user_tool 
    ON public.agent_actions (user_id, tool_name, created_at DESC);

ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'agent_actions' AND policyname = 'Users can view their own agent actions'
    ) THEN
        CREATE POLICY "Users can view their own agent actions"
            ON public.agent_actions
            FOR ALL
            TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'agent_actions' AND policyname = 'Service role has full access to agent actions'
    ) THEN
        CREATE POLICY "Service role has full access to agent actions"
            ON public.agent_actions
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
