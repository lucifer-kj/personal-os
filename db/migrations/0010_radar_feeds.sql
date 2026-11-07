-- ============================================================================
-- Migration 0010: The Radar (Curated RSS & Atom Feeds)
-- Single-User Enclave Workspace
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rss_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    site_url TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    icon_url TEXT,
    last_fetched_at TIMESTAMPTZ,
    fetch_error TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_rss_feeds_user_url UNIQUE (user_id, url)
);

CREATE TABLE IF NOT EXISTS public.radar_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feed_id UUID NOT NULL REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    author TEXT,
    summary TEXT,
    content TEXT,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_starred BOOLEAN NOT NULL DEFAULT false,
    promoted_to_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
    promoted_to_post_id UUID REFERENCES public.social_posts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_radar_items_user_feed_url UNIQUE (user_id, feed_id, url)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rss_feeds_user ON public.rss_feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_radar_items_user_feed ON public.radar_items(user_id, feed_id);
CREATE INDEX IF NOT EXISTS idx_radar_items_user_published ON public.radar_items(user_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_radar_items_user_read ON public.radar_items(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_radar_items_user_starred ON public.radar_items(user_id, is_starred);

-- Row Level Security
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own RSS feeds"
    ON public.rss_feeds FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own radar items"
    ON public.radar_items FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
