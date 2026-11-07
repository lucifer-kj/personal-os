export type NoteType =
  | "standard"
  | "meeting"
  | "concept"
  | "project"
  | "reference";

export type ContentFormat = "markdown" | "plain_text" | "tiptap_json";

export type LinkType = "related" | "references" | "derived_from";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  content_format: ContentFormat;
  note_type: NoteType;
  project_id: string | null;
  task_id: string | null;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface NoteLink {
  id: string;
  user_id: string;
  source_note_id: string;
  target_note_id: string;
  link_type: LinkType;
  created_at: string;
}

export interface NoteWithLinks extends Note {
  outward_links?: (NoteLink & { target_note?: { id: string; title: string } })[];
  inward_links?: (NoteLink & { source_note?: { id: string; title: string } })[];
}

export interface CreateNoteDTO {
  user_id: string;
  title: string;
  content?: string;
  content_format?: ContentFormat;
  note_type?: NoteType;
  project_id?: string | null;
  task_id?: string | null;
  tags?: string[];
  is_pinned?: boolean;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  content_format?: ContentFormat;
  note_type?: NoteType;
  project_id?: string | null;
  task_id?: string | null;
  tags?: string[];
  is_pinned?: boolean;
  is_archived?: boolean;
}

export interface NoteFilters {
  search?: string;
  tag?: string;
  project_id?: string;
  task_id?: string;
  note_type?: NoteType;
  is_pinned?: boolean;
  is_archived?: boolean;
}

export interface INoteRepository {
  findMany(userId: string, filters?: NoteFilters): Promise<Note[]>;
  findById(userId: string, id: string): Promise<Note | null>;
  create(data: CreateNoteDTO): Promise<Note>;
  update(userId: string, id: string, data: UpdateNoteDTO): Promise<Note>;
  delete(userId: string, id: string, hard?: boolean): Promise<boolean>;
  getLinks(userId: string, noteId: string): Promise<{
    outward: (NoteLink & { target_note?: { id: string; title: string } })[];
    inward: (NoteLink & { source_note?: { id: string; title: string } })[];
  }>;
  createLink(userId: string, sourceNoteId: string, targetNoteId: string, linkType?: LinkType): Promise<NoteLink>;
  deleteLink(userId: string, sourceNoteId: string, targetNoteId: string): Promise<boolean>;
  getAllTags(userId: string): Promise<string[]>;
}
