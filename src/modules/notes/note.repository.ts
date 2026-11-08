import { SupabaseClient } from "@supabase/supabase-js";
import { InfrastructureError } from "@/lib/errors";
import {
  Note,
  NoteLink,
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteFilters,
  INoteRepository,
  LinkType,
} from "./types";

export class InMemoryNoteRepository implements INoteRepository {
  private notes: Map<string, Note> = new Map();
  private links: Map<string, NoteLink> = new Map();

  async findMany(userId: string, filters: NoteFilters = {}): Promise<Note[]> {
    let result = Array.from(this.notes.values()).filter(
      (n) => n.user_id === userId && !n.deleted_at
    );

    if (filters.is_archived !== undefined) {
      result = result.filter((n) => n.is_archived === filters.is_archived);
    } else {
      // Default to non-archived notes
      result = result.filter((n) => !n.is_archived);
    }

    if (filters.is_pinned !== undefined) {
      result = result.filter((n) => n.is_pinned === filters.is_pinned);
    }

    if (filters.note_type) {
      result = result.filter((n) => n.note_type === filters.note_type);
    }

    if (filters.project_id) {
      result = result.filter((n) => n.project_id === filters.project_id);
    }

    if (filters.task_id) {
      result = result.filter((n) => n.task_id === filters.task_id);
    }

    if (filters.tag) {
      const matchTag = filters.tag.toLowerCase();
      result = result.filter((n) =>
        n.tags.some((t) => t.toLowerCase() === matchTag)
      );
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.content.toLowerCase().includes(term) ||
          n.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    // Sort: pinned first, then updated_at DESC
    result.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });

    return result;
  }

  async findById(userId: string, id: string): Promise<Note | null> {
    const note = this.notes.get(id);
    if (!note || note.user_id !== userId || note.deleted_at) {
      return null;
    }
    return note;
  }

  async create(data: CreateNoteDTO): Promise<Note> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const note: Note = {
      id,
      user_id: data.user_id,
      title: data.title.trim() || "Untitled Note",
      content: data.content ?? "",
      content_format: data.content_format || "markdown",
      note_type: data.note_type || "standard",
      project_id: data.project_id ?? null,
      task_id: data.task_id ?? null,
      tags: data.tags ?? [],
      is_pinned: data.is_pinned ?? false,
      is_archived: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    this.notes.set(id, note);
    return note;
  }

  async update(userId: string, id: string, data: UpdateNoteDTO): Promise<Note> {
    const existing = await this.findById(userId, id);
    if (!existing) {
      throw new Error(`Note with id ${id} not found`);
    }

    const updated: Note = {
      ...existing,
      ...data,
      title: data.title !== undefined ? data.title.trim() || "Untitled Note" : existing.title,
      content: data.content !== undefined ? data.content : existing.content,
      tags: data.tags !== undefined ? data.tags : existing.tags,
      project_id: data.project_id !== undefined ? data.project_id : existing.project_id,
      task_id: data.task_id !== undefined ? data.task_id : existing.task_id,
      is_pinned: data.is_pinned !== undefined ? data.is_pinned : existing.is_pinned,
      is_archived: data.is_archived !== undefined ? data.is_archived : existing.is_archived,
      updated_at: new Date().toISOString(),
    };

    this.notes.set(id, updated);
    return updated;
  }

  async delete(userId: string, id: string, hard = false): Promise<boolean> {
    const existing = this.notes.get(id);
    if (!existing || existing.user_id !== userId) return false;

    if (hard) {
      this.notes.delete(id);
      // Remove all linked references
      for (const [linkId, link] of this.links.entries()) {
        if (link.source_note_id === id || link.target_note_id === id) {
          this.links.delete(linkId);
        }
      }
    } else {
      existing.deleted_at = new Date().toISOString();
      this.notes.set(id, existing);
    }
    return true;
  }

  async getLinks(
    userId: string,
    noteId: string
  ): Promise<{
    outward: (NoteLink & { target_note?: { id: string; title: string } })[];
    inward: (NoteLink & { source_note?: { id: string; title: string } })[];
  }> {
    const outward: (NoteLink & { target_note?: { id: string; title: string } })[] = [];
    const inward: (NoteLink & { source_note?: { id: string; title: string } })[] = [];

    for (const link of this.links.values()) {
      if (link.user_id !== userId) continue;

      if (link.source_note_id === noteId) {
        const target = this.notes.get(link.target_note_id);
        if (target && !target.deleted_at) {
          outward.push({
            ...link,
            target_note: { id: target.id, title: target.title },
          });
        }
      }

      if (link.target_note_id === noteId) {
        const source = this.notes.get(link.source_note_id);
        if (source && !source.deleted_at) {
          inward.push({
            ...link,
            source_note: { id: source.id, title: source.title },
          });
        }
      }
    }

    return { outward, inward };
  }

  async createLink(
    userId: string,
    sourceNoteId: string,
    targetNoteId: string,
    linkType: LinkType = "related"
  ): Promise<NoteLink> {
    if (sourceNoteId === targetNoteId) {
      throw new Error("A note cannot link to itself");
    }

    const source = await this.findById(userId, sourceNoteId);
    const target = await this.findById(userId, targetNoteId);
    if (!source || !target) {
      throw new Error("Source or target note not found");
    }

    // Check existing
    const existing = Array.from(this.links.values()).find(
      (l) =>
        l.user_id === userId &&
        l.source_note_id === sourceNoteId &&
        l.target_note_id === targetNoteId
    );
    if (existing) return existing;

    const id = crypto.randomUUID();
    const link: NoteLink = {
      id,
      user_id: userId,
      source_note_id: sourceNoteId,
      target_note_id: targetNoteId,
      link_type: linkType,
      created_at: new Date().toISOString(),
    };

    this.links.set(id, link);
    return link;
  }

  async deleteLink(
    userId: string,
    sourceNoteId: string,
    targetNoteId: string
  ): Promise<boolean> {
    for (const [id, link] of this.links.entries()) {
      if (
        link.user_id === userId &&
        link.source_note_id === sourceNoteId &&
        link.target_note_id === targetNoteId
      ) {
        this.links.delete(id);
        return true;
      }
    }
    return false;
  }

  async getAllTags(userId: string): Promise<string[]> {
    const tagSet = new Set<string>();
    for (const note of this.notes.values()) {
      if (note.user_id === userId && !note.deleted_at && !note.is_archived) {
        for (const t of note.tags) {
          tagSet.add(t);
        }
      }
    }
    return Array.from(tagSet).sort();
  }

  clear(): void {
    this.notes.clear();
    this.links.clear();
  }
}

export class SupabaseNoteRepository implements INoteRepository {
  constructor(private supabase: SupabaseClient) {}

  async findMany(userId: string, filters: NoteFilters = {}): Promise<Note[]> {
    let query = this.supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (filters.is_archived !== undefined) {
      query = query.eq("is_archived", filters.is_archived);
    } else {
      query = query.eq("is_archived", false);
    }

    if (filters.is_pinned !== undefined) {
      query = query.eq("is_pinned", filters.is_pinned);
    }

    if (filters.note_type) {
      query = query.eq("note_type", filters.note_type);
    }

    if (filters.project_id) {
      query = query.eq("project_id", filters.project_id);
    }

    if (filters.task_id) {
      query = query.eq("task_id", filters.task_id);
    }

    if (filters.tag) {
      query = query.contains("tags", [filters.tag.toLowerCase()]);
    }

    if (filters.search) {
      const term = `%${filters.search}%`;
      query = query.or(`title.ilike.${term},content.ilike.${term}`);
    }

    query = query
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    return (data || []) as Note[];
  }

  async findById(userId: string, id: string): Promise<Note | null> {
    const { data, error } = await this.supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch note: ${error.message}`);
    }

    return (data as Note) || null;
  }

  async create(data: CreateNoteDTO): Promise<Note> {
    const { data: note, error } = await this.supabase
      .from("notes")
      .insert({
        user_id: data.user_id,
        title: data.title.trim() || "Untitled Note",
        content: data.content ?? "",
        content_format: data.content_format || "markdown",
        note_type: data.note_type || "standard",
        project_id: data.project_id ?? null,
        task_id: data.task_id ?? null,
        tags: data.tags ?? [],
        is_pinned: data.is_pinned ?? false,
      })
      .select()
      .single();

    if (error || !note) {
      throw new Error(`Failed to create note: ${error?.message}`);
    }

    return note as Note;
  }

  async update(userId: string, id: string, data: UpdateNoteDTO): Promise<Note> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim() || "Untitled Note";
    if (data.content !== undefined) updatePayload.content = data.content;
    if (data.content_format !== undefined) updatePayload.content_format = data.content_format;
    if (data.note_type !== undefined) updatePayload.note_type = data.note_type;
    if (data.project_id !== undefined) updatePayload.project_id = data.project_id;
    if (data.task_id !== undefined) updatePayload.task_id = data.task_id;
    if (data.tags !== undefined) updatePayload.tags = data.tags;
    if (data.is_pinned !== undefined) updatePayload.is_pinned = data.is_pinned;
    if (data.is_archived !== undefined) updatePayload.is_archived = data.is_archived;

    const { data: note, error } = await this.supabase
      .from("notes")
      .update(updatePayload)
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error || !note) {
      throw new Error(`Failed to update note: ${error?.message}`);
    }

    return note as Note;
  }

  async delete(userId: string, id: string, hard = false): Promise<boolean> {
    if (hard) {
      const { error } = await this.supabase
        .from("notes")
        .delete()
        .eq("user_id", userId)
        .eq("id", id);
      return !error;
    } else {
      const { error } = await this.supabase
        .from("notes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("id", id);
      return !error;
    }
  }

  async getLinks(
    userId: string,
    noteId: string
  ): Promise<{
    outward: (NoteLink & { target_note?: { id: string; title: string } })[];
    inward: (NoteLink & { source_note?: { id: string; title: string } })[];
  }> {
    const [outwardRes, inwardRes] = await Promise.all([
      this.supabase
        .from("note_links")
        .select("*, target_note:target_note_id(id, title)")
        .eq("user_id", userId)
        .eq("source_note_id", noteId),
      this.supabase
        .from("note_links")
        .select("*, source_note:source_note_id(id, title)")
        .eq("user_id", userId)
        .eq("target_note_id", noteId),
    ]);

    return {
      outward: (outwardRes.data || []) as (NoteLink & { target_note?: { id: string; title: string } })[],
      inward: (inwardRes.data || []) as (NoteLink & { source_note?: { id: string; title: string } })[],
    };
  }

  async createLink(
    userId: string,
    sourceNoteId: string,
    targetNoteId: string,
    linkType: LinkType = "related"
  ): Promise<NoteLink> {
    const { data: link, error } = await this.supabase
      .from("note_links")
      .insert({
        user_id: userId,
        source_note_id: sourceNoteId,
        target_note_id: targetNoteId,
        link_type: linkType,
      })
      .select()
      .single();

    if (error || !link) {
      throw new Error(`Failed to create note link: ${error?.message}`);
    }

    return link as NoteLink;
  }

  async deleteLink(
    userId: string,
    sourceNoteId: string,
    targetNoteId: string
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from("note_links")
      .delete()
      .eq("user_id", userId)
      .eq("source_note_id", sourceNoteId)
      .eq("target_note_id", targetNoteId);

    return !error;
  }

  async getAllTags(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("notes")
      .select("tags")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .eq("is_archived", false);

    if (error) return [];

    const set = new Set<string>();
    for (const row of data || []) {
      if (Array.isArray(row.tags)) {
        for (const t of row.tags) set.add(t);
      }
    }
    return Array.from(set).sort();
  }
}

const globalInMemoryNoteRepo = new InMemoryNoteRepository();

export function getNoteRepository(
  client?: SupabaseClient | null
): INoteRepository {
  if (client) {
    return new SupabaseNoteRepository(client);
  }
  if (process.env.NODE_ENV === "production") {
    throw new InfrastructureError(
      "Supabase client is required in production. In-memory persistence fallback is disabled."
    );
  }
  return globalInMemoryNoteRepo;
}

export function getInMemoryNoteRepository(): InMemoryNoteRepository {
  return globalInMemoryNoteRepo;
}
