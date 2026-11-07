import { describe, it, expect, beforeEach } from "vitest";
import { NoteService } from "./note.service";
import { InMemoryNoteRepository } from "./note.repository";
import { InMemoryProjectRepository } from "../projects/project.repository";
import { InMemoryTaskRepository } from "../tasks/task.repository";

describe("NoteService", () => {
  let noteRepo: InMemoryNoteRepository;
  let projectRepo: InMemoryProjectRepository;
  let taskRepo: InMemoryTaskRepository;
  let service: NoteService;
  const userId = "test-user-notes";

  beforeEach(() => {
    noteRepo = new InMemoryNoteRepository();
    projectRepo = new InMemoryProjectRepository();
    taskRepo = new InMemoryTaskRepository();
    service = new NoteService(noteRepo, projectRepo, taskRepo);
  });

  it("creates, retrieves, and updates notes", async () => {
    const note = await service.createNote(userId, {
      title: "Clean Architecture in Next.js",
      content: "# Clean Architecture\n\nNotes on boundaries...",
      note_type: "concept",
      tags: ["architecture", "clean-code"],
    });

    expect(note.id).toBeDefined();
    expect(note.title).toBe("Clean Architecture in Next.js");

    const retrieved = await service.getNote(userId, note.id);
    expect(retrieved?.title).toBe("Clean Architecture in Next.js");
    expect(retrieved?.tags).toContain("architecture");

    const updated = await service.updateNote(userId, note.id, {
      title: "Modular Clean Architecture",
      content: "# Updated Content",
    });
    expect(updated.title).toBe("Modular Clean Architecture");
  });

  it("filters notes by search keyword and tag", async () => {
    await service.createNote(userId, {
      title: "Database Migrations",
      content: "PostgreSQL RLS setup",
      tags: ["database", "postgres"],
    });

    await service.createNote(userId, {
      title: "React Server Components",
      content: "Next.js streaming",
      tags: ["react", "frontend"],
    });

    const tagFiltered = await service.listNotes(userId, { tag: "database" });
    expect(tagFiltered).toHaveLength(1);
    expect(tagFiltered[0]?.title).toBe("Database Migrations");

    const searchFiltered = await service.listNotes(userId, { search: "streaming" });
    expect(searchFiltered).toHaveLength(1);
    expect(searchFiltered[0]?.title).toBe("React Server Components");
  });

  it("handles note pinning and archive workflows", async () => {
    const note = await service.createNote(userId, {
      title: "Daily Standup Notes",
    });

    expect(note.is_pinned).toBe(false);

    const pinned = await service.togglePin(userId, note.id);
    expect(pinned.is_pinned).toBe(true);

    const archived = await service.toggleArchive(userId, note.id);
    expect(archived.is_archived).toBe(true);

    // Active list excludes archived by default
    const active = await service.listNotes(userId);
    expect(active.some((n) => n.id === note.id)).toBe(false);

    // Filter by archived includes it
    const archivedList = await service.listNotes(userId, { is_archived: true });
    expect(archivedList.some((n) => n.id === note.id)).toBe(true);
  });

  it("links notes and prevents self-linking", async () => {
    const noteA = await service.createNote(userId, { title: "Note Alpha" });
    const noteB = await service.createNote(userId, { title: "Note Beta" });

    const link = await service.linkNotes(userId, noteA.id, noteB.id, "references");
    expect(link.source_note_id).toBe(noteA.id);
    expect(link.target_note_id).toBe(noteB.id);

    const noteAWithLinks = await service.getNote(userId, noteA.id);
    expect(noteAWithLinks?.outward_links).toHaveLength(1);
    expect(noteAWithLinks?.outward_links?.[0]?.target_note?.title).toBe("Note Beta");

    const noteBWithLinks = await service.getNote(userId, noteB.id);
    expect(noteBWithLinks?.inward_links).toHaveLength(1);
    expect(noteBWithLinks?.inward_links?.[0]?.source_note?.title).toBe("Note Alpha");

    // Self linking must fail
    await expect(
      service.linkNotes(userId, noteA.id, noteA.id)
    ).rejects.toThrow("A note cannot link to itself");
  });

  it("extracts wiki-style markdown links [[Title]]", () => {
    const markdown = "See also [[System Design]] and [[NextJS Patterns]] for more info. [[System Design]] duplicate.";
    const links = service.extractWikiLinks(markdown);
    expect(links).toEqual(["System Design", "NextJS Patterns"]);
  });
});
