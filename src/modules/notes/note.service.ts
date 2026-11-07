import {
  INoteRepository,
  Note,
  NoteWithLinks,
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteFilters,
  NoteLink,
  LinkType,
} from "./types";
import { IProjectRepository } from "../projects/project.repository";
import { ITaskRepository } from "../tasks/task.repository";

export class NoteService {
  constructor(
    private noteRepo: INoteRepository,
    private projectRepo?: IProjectRepository,
    private taskRepo?: ITaskRepository
  ) {}

  async listNotes(userId: string, filters: NoteFilters = {}): Promise<Note[]> {
    return this.noteRepo.findMany(userId, filters);
  }

  async getNote(userId: string, id: string): Promise<NoteWithLinks | null> {
    const note = await this.noteRepo.findById(userId, id);
    if (!note) return null;

    const links = await this.noteRepo.getLinks(userId, id);
    return {
      ...note,
      outward_links: links.outward,
      inward_links: links.inward,
    };
  }

  async createNote(
    userId: string,
    data: Omit<CreateNoteDTO, "user_id">
  ): Promise<Note> {
    // Validate project existence if project_id provided
    if (data.project_id && this.projectRepo) {
      const project = await this.projectRepo.findById(userId, data.project_id);
      if (!project) {
        throw new Error(`Referenced project ${data.project_id} does not exist`);
      }
    }

    // Validate task existence if task_id provided
    if (data.task_id && this.taskRepo) {
      const task = await this.taskRepo.findById(userId, data.task_id);
      if (!task) {
        throw new Error(`Referenced task ${data.task_id} does not exist`);
      }
    }

    return this.noteRepo.create({
      ...data,
      user_id: userId,
    });
  }

  async updateNote(
    userId: string,
    id: string,
    data: UpdateNoteDTO
  ): Promise<Note> {
    const existing = await this.noteRepo.findById(userId, id);
    if (!existing) {
      throw new Error(`Note not found`);
    }

    if (data.project_id && this.projectRepo) {
      const project = await this.projectRepo.findById(userId, data.project_id);
      if (!project) {
        throw new Error(`Referenced project ${data.project_id} does not exist`);
      }
    }

    if (data.task_id && this.taskRepo) {
      const task = await this.taskRepo.findById(userId, data.task_id);
      if (!task) {
        throw new Error(`Referenced task ${data.task_id} does not exist`);
      }
    }

    return this.noteRepo.update(userId, id, data);
  }

  async deleteNote(
    userId: string,
    id: string,
    hard = false
  ): Promise<boolean> {
    return this.noteRepo.delete(userId, id, hard);
  }

  async togglePin(userId: string, id: string): Promise<Note> {
    const existing = await this.noteRepo.findById(userId, id);
    if (!existing) {
      throw new Error(`Note not found`);
    }
    return this.noteRepo.update(userId, id, {
      is_pinned: !existing.is_pinned,
    });
  }

  async toggleArchive(userId: string, id: string): Promise<Note> {
    const existing = await this.noteRepo.findById(userId, id);
    if (!existing) {
      throw new Error(`Note not found`);
    }
    return this.noteRepo.update(userId, id, {
      is_archived: !existing.is_archived,
    });
  }

  async linkNotes(
    userId: string,
    sourceNoteId: string,
    targetNoteId: string,
    linkType: LinkType = "related"
  ): Promise<NoteLink> {
    return this.noteRepo.createLink(
      userId,
      sourceNoteId,
      targetNoteId,
      linkType
    );
  }

  async unlinkNotes(
    userId: string,
    sourceNoteId: string,
    targetNoteId: string
  ): Promise<boolean> {
    return this.noteRepo.deleteLink(userId, sourceNoteId, targetNoteId);
  }

  async getAllTags(userId: string): Promise<string[]> {
    return this.noteRepo.getAllTags(userId);
  }

  /**
   * Scans markdown text for [[Title]] wiki-links and returns matched titles
   */
  extractWikiLinks(content: string): string[] {
    const matches = content.matchAll(/\[\[(.*?)\]\]/g);
    const titles: string[] = [];
    for (const match of matches) {
      const title = match[1]?.trim();
      if (title && !titles.includes(title)) {
        titles.push(title);
      }
    }
    return titles;
  }
}
