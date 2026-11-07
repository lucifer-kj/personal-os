import { SupabaseClient } from "@supabase/supabase-js";
import { SearchQuery, SearchResultItem, SearchResultType } from "./types";

export interface ISearchRepository {
  search(userId: string, query: SearchQuery): Promise<SearchResultItem[]>;
}

export class InMemorySearchRepository implements ISearchRepository {
  private items: Array<{
    id: string;
    userId: string;
    type: SearchResultType;
    title: string;
    description?: string;
    url: string;
    status?: string;
    metadata?: Record<string, unknown>;
  }> = [];

  constructor(
    initialItems?: Array<{
      id: string;
      userId: string;
      type: SearchResultType;
      title: string;
      description?: string;
      url: string;
      status?: string;
      metadata?: Record<string, unknown>;
    }>
  ) {
    if (initialItems) {
      this.items = [...initialItems];
    }
  }

  addItem(item: {
    id: string;
    userId: string;
    type: SearchResultType;
    title: string;
    description?: string;
    url: string;
    status?: string;
    metadata?: Record<string, unknown>;
  }): void {
    this.items.push(item);
  }

  async search(userId: string, query: SearchQuery): Promise<SearchResultItem[]> {
    const term = query.q.toLowerCase().trim();
    const allowedTypes = query.types && query.types.length > 0 ? query.types : null;
    const limit = query.limit || 20;

    const matched: SearchResultItem[] = [];

    for (const item of this.items) {
      if (item.userId !== userId) continue;
      if (allowedTypes && !allowedTypes.includes(item.type)) continue;

      const titleLower = item.title.toLowerCase();
      const descLower = (item.description || "").toLowerCase();

      let score = 0;
      if (titleLower === term) {
        score = 100;
      } else if (titleLower.startsWith(term)) {
        score = 80;
      } else if (titleLower.includes(term)) {
        score = 50;
      } else if (descLower.includes(term)) {
        score = 25;
      }

      if (score > 0) {
        matched.push({
          id: item.id,
          type: item.type,
          title: item.title,
          subtitle: item.description,
          snippet: item.description,
          url: item.url,
          status: item.status,
          metadata: item.metadata,
          score,
        });
      }
    }

    matched.sort((a, b) => (b.score || 0) - (a.score || 0));
    return matched.slice(0, limit);
  }
}

export class SupabaseSearchRepository implements ISearchRepository {
  constructor(private client: SupabaseClient) {}

  async search(userId: string, query: SearchQuery): Promise<SearchResultItem[]> {
    const term = query.q.trim();
    const termLower = term.toLowerCase();
    const pattern = `%${term}%`;
    const allowedTypes = query.types && query.types.length > 0 ? query.types : null;
    const limit = query.limit || 20;

    const promises: Promise<SearchResultItem[]>[] = [];

    // Search tasks
    if (!allowedTypes || allowedTypes.includes("task")) {
      promises.push(
        (async (): Promise<SearchResultItem[]> => {
          const { data, error } = await this.client
            .from("tasks")
            .select("id, title, description, status, priority, project_id")
            .eq("user_id", userId)
            .or(`title.ilike.${pattern},description.ilike.${pattern}`)
            .limit(limit);

          if (error || !data) return [];
          return data.map((t) => {
            const tLower = t.title.toLowerCase();
            let score = 30;
            if (tLower === termLower) score = 100;
            else if (tLower.startsWith(termLower)) score = 80;
            else if (tLower.includes(termLower)) score = 50;

            return {
              id: t.id,
              type: "task",
              title: t.title,
              subtitle: t.description || undefined,
              snippet: t.description || undefined,
              url: `/tasks?selected=${t.id}`,
              status: t.status,
              metadata: { priority: t.priority, projectId: t.project_id },
              score,
            };
          });
        })()
      );
    }

    // Search projects
    if (!allowedTypes || allowedTypes.includes("project")) {
      promises.push(
        (async (): Promise<SearchResultItem[]> => {
          const { data, error } = await this.client
            .from("projects")
            .select("id, title, description, status, color")
            .eq("user_id", userId)
            .or(`title.ilike.${pattern},description.ilike.${pattern}`)
            .limit(limit);

          if (error || !data) return [];
          return data.map((p) => {
            const pLower = p.title.toLowerCase();
            let score = 35;
            if (pLower === termLower) score = 100;
            else if (pLower.startsWith(termLower)) score = 80;
            else if (pLower.includes(termLower)) score = 50;

            return {
              id: p.id,
              type: "project",
              title: p.title,
              subtitle: p.description || undefined,
              snippet: p.description || undefined,
              url: `/projects/${p.id}`,
              status: p.status,
              metadata: { color: p.color },
              score,
            };
          });
        })()
      );
    }

    // Search notes
    if (!allowedTypes || allowedTypes.includes("note")) {
      promises.push(
        (async (): Promise<SearchResultItem[]> => {
          const { data, error } = await this.client
            .from("notes")
            .select("id, title, content, note_type, tags")
            .eq("user_id", userId)
            .or(`title.ilike.${pattern},content.ilike.${pattern}`)
            .limit(limit);

          if (error || !data) return [];
          return data.map((n) => {
            const nLower = (n.title || "").toLowerCase();
            let score = 25;
            if (nLower === termLower) score = 100;
            else if (nLower.startsWith(termLower)) score = 80;
            else if (nLower.includes(termLower)) score = 50;

            return {
              id: n.id,
              type: "note",
              title: n.title || "Untitled Note",
              subtitle: n.content ? n.content.substring(0, 80) : undefined,
              snippet: n.content ? n.content.substring(0, 120) : undefined,
              url: `/notes?noteId=${n.id}`,
              metadata: { noteType: n.note_type, tags: n.tags },
              score,
            };
          });
        })()
      );
    }

    // Search habits
    if (!allowedTypes || allowedTypes.includes("habit")) {
      promises.push(
        (async (): Promise<SearchResultItem[]> => {
          const { data, error } = await this.client
            .from("habits")
            .select("id, title, description, frequency, color")
            .eq("user_id", userId)
            .or(`title.ilike.${pattern},description.ilike.${pattern}`)
            .limit(limit);

          if (error || !data) return [];
          return data.map((h) => {
            const hLower = h.title.toLowerCase();
            let score = 20;
            if (hLower === termLower) score = 100;
            else if (hLower.startsWith(termLower)) score = 80;
            else if (hLower.includes(termLower)) score = 50;

            return {
              id: h.id,
              type: "habit",
              title: h.title,
              subtitle: h.description || `Frequency: ${h.frequency}`,
              url: "/habits",
              status: h.frequency,
              metadata: { color: h.color },
              score,
            };
          });
        })()
      );
    }

    // Search inbox items
    if (!allowedTypes || allowedTypes.includes("inbox")) {
      promises.push(
        (async (): Promise<SearchResultItem[]> => {
          const { data, error } = await this.client
            .from("inbox_items")
            .select("id, content, capture_type, is_processed")
            .eq("user_id", userId)
            .ilike("content", pattern)
            .limit(limit);

          if (error || !data) return [];
          return data.map((i) => {
            const iLower = i.content.toLowerCase();
            let score = 15;
            if (iLower.startsWith(termLower)) score = 70;
            else score = 40;

            return {
              id: i.id,
              type: "inbox",
              title: i.content.length > 50 ? i.content.substring(0, 50) + "..." : i.content,
              subtitle: `Type: ${i.capture_type}${i.is_processed ? " (processed)" : ""}`,
              snippet: i.content,
              url: "/inbox",
              status: i.is_processed ? "processed" : "inbox",
              score,
            };
          });
        })()
      );
    }

    const resultsByGroup = await Promise.all(promises);
    const combined = resultsByGroup.flat();

    combined.sort((a, b) => (b.score || 0) - (a.score || 0));
    return combined.slice(0, limit);
  }
}

export function getSearchRepository(client?: SupabaseClient | null): ISearchRepository {
  if (client) {
    return new SupabaseSearchRepository(client);
  }
  return new InMemorySearchRepository();
}
