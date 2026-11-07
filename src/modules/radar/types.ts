export interface RSSFeed {
  id: string;
  user_id: string;
  title: string;
  url: string;
  site_url: string | null;
  category: string;
  icon_url: string | null;
  last_fetched_at: string | null;
  fetch_error: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RadarItem {
  id: string;
  user_id: string;
  feed_id: string;
  title: string;
  url: string;
  author: string | null;
  summary: string | null;
  content: string | null;
  published_at: string;
  is_read: boolean;
  is_starred: boolean;
  promoted_to_note_id: string | null;
  promoted_to_post_id: string | null;
  created_at: string;
  feed?: {
    title: string;
    category: string;
  };
}

export interface CreateFeedDTO {
  url: string;
  title?: string;
  category?: string;
}

export interface RadarFilter {
  feed_id?: string;
  category?: string;
  is_read?: boolean;
  is_starred?: boolean;
  search?: string;
}

export interface PromoteRadarItemDTO {
  target: "note" | "post";
  title?: string;
  notes?: string;
}
