import { SupabaseClient } from "@supabase/supabase-js";
import { IRadarRepository, getRadarRepository } from "./radar.repository";
import { fetchAndParseFeed } from "./rss.service";
import {
  RSSFeed,
  RadarItem,
  CreateFeedDTO,
  RadarFilter,
} from "./types";
import { NoteService } from "@/modules/notes/note.service";
import { SocialStudioService } from "@/modules/studio/studio.service";

export class RadarService {
  constructor(private repo: IRadarRepository) {}

  async listFeeds(userId: string): Promise<RSSFeed[]> {
    return this.repo.findFeeds(userId);
  }

  async subscribeFeed(userId: string, dto: CreateFeedDTO): Promise<RSSFeed> {
    // 1. Fetch and validate feed structure
    let parsed;
    try {
      parsed = await fetchAndParseFeed(dto.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch or parse RSS feed";
      throw new Error(`Invalid RSS Feed: ${msg}`);
    }

    const title = dto.title?.trim() || parsed.title || "Untitled Feed";
    const category = dto.category?.trim() || "General";

    // 2. Create feed in database
    const feed = await this.repo.createFeed(userId, {
      url: dto.url,
      title,
      category,
      site_url: parsed.siteUrl,
    });

    // 3. Immediately ingest initial items
    if (parsed.items.length > 0) {
      await this.repo.upsertItems(
        userId,
        feed.id,
        parsed.items.map((it) => ({
          title: it.title,
          url: it.url,
          author: it.author,
          summary: it.summary,
          content: it.content,
          published_at: it.publishedAt,
        }))
      );
      await this.repo.updateFeed(userId, feed.id, {
        last_fetched_at: new Date().toISOString(),
        fetch_error: null,
      });
    }

    return feed;
  }

  async syncFeeds(userId: string, targetFeedId?: string): Promise<{ synced: number; itemsAdded: number }> {
    const feeds = await this.repo.findFeeds(userId);
    const activeFeeds = feeds.filter((f) => f.is_active && (!targetFeedId || f.id === targetFeedId));

    let itemsAdded = 0;
    let synced = 0;

    for (const feed of activeFeeds) {
      try {
        const parsed = await fetchAndParseFeed(feed.url);
        if (parsed.items.length > 0) {
          const count = await this.repo.upsertItems(
            userId,
            feed.id,
            parsed.items.map((it) => ({
              title: it.title,
              url: it.url,
              author: it.author,
              summary: it.summary,
              content: it.content,
              published_at: it.publishedAt,
            }))
          );
          itemsAdded += count;
        }

        await this.repo.updateFeed(userId, feed.id, {
          last_fetched_at: new Date().toISOString(),
          fetch_error: null,
        });
        synced++;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Sync error";
        await this.repo.updateFeed(userId, feed.id, {
          fetch_error: errorMsg,
          last_fetched_at: new Date().toISOString(),
        });
      }
    }

    return { synced, itemsAdded };
  }

  async listItems(userId: string, filters?: RadarFilter): Promise<RadarItem[]> {
    return this.repo.findItems(userId, filters);
  }

  async getItem(userId: string, id: string): Promise<RadarItem | null> {
    return this.repo.findItemById(userId, id);
  }

  async markItemRead(userId: string, id: string, isRead = true): Promise<RadarItem | null> {
    return this.repo.updateItem(userId, id, { is_read: isRead });
  }

  async toggleItemStarred(userId: string, id: string): Promise<RadarItem | null> {
    const item = await this.repo.findItemById(userId, id);
    if (!item) return null;
    return this.repo.updateItem(userId, id, { is_starred: !item.is_starred });
  }

  async promoteToNote(
    userId: string,
    itemId: string,
    noteService: NoteService,
    userNotes?: string
  ) {
    const item = await this.repo.findItemById(userId, itemId);
    if (!item) throw new Error("Radar item not found");

    const sourceTag = item.feed?.category ? item.feed.category.toLowerCase().replace(/\s+/g, "-") : "radar";
    const content = [
      `# ${item.title}`,
      ``,
      `> **Source:** [${item.author || item.feed?.title || "Article"}](${item.url})  `,
      `> **Published:** ${new Date(item.published_at).toLocaleDateString()}`,
      ``,
      `### Executive Summary`,
      item.summary || item.content || "_No content available_",
      ``,
      userNotes ? `### Personal Synthesis\n${userNotes}` : "",
    ].join("\n");

    const note = await noteService.createNote(userId, {
      title: item.title,
      content,
      note_type: "concept",
      tags: ["radar", sourceTag],
    });

    await this.repo.updateItem(userId, itemId, {
      is_read: true,
      promoted_to_note_id: note.id,
    });

    return note;
  }

  async promoteToSocialPost(
    userId: string,
    itemId: string,
    studioService: SocialStudioService,
    platform: "x" | "linkedin" | "threads" | "generic" = "x"
  ) {
    const item = await this.repo.findItemById(userId, itemId);
    if (!item) throw new Error("Radar item not found");

    const snippet = item.summary
      ? item.summary.slice(0, 140) + (item.summary.length > 140 ? "..." : "")
      : "";

    let draftContent = `${item.title}\n\n${snippet}\n\nRead more: ${item.url}\n#radar #signal`;
    if (draftContent.length > 280 && platform === "x") {
      draftContent = `${item.title.slice(0, 180)}...\n\n${item.url}\n#radar`;
    }

    const post = await studioService.createPost(userId, {
      title: `Radar: ${item.title.slice(0, 40)}`,
      content: draftContent,
      platform,
      status: "draft",
      tags: ["radar", "curation"],
    });

    await this.repo.updateItem(userId, itemId, {
      is_read: true,
      promoted_to_post_id: post.id,
    });

    return post;
  }

  async deleteFeed(userId: string, feedId: string): Promise<boolean> {
    return this.repo.deleteFeed(userId, feedId);
  }
}

export function getRadarService(supabase?: SupabaseClient | null): RadarService {
  return new RadarService(getRadarRepository(supabase));
}
