-- ============================================================================
-- Migration: 0009_social_studio.sql
-- Description: Social Media Studio and Content Drafter schema with RLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    platform TEXT NOT NULL DEFAULT 'x' CHECK (platform IN ('x', 'linkedin', 'threads', 'generic')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    media_type TEXT NOT NULL DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video', 'mixed')),
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_user_status ON public.social_posts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON public.social_posts(user_id, scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON public.social_posts(user_id, created_at DESC);

-- Row-Level Security (RLS)
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own social posts"
    ON public.social_posts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Storage bucket for media assets (if storage schema exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-assets', 'media-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own media assets"
    ON storage.objects FOR ALL
    USING (bucket_id = 'media-assets' AND auth.uid() = owner)
    WITH CHECK (bucket_id = 'media-assets' AND auth.uid() = owner);
