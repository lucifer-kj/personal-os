import { describe, it, expect } from "vitest";
import {
  createNoteSchema,
  updateNoteSchema,
  createNoteLinkSchema,
  noteQuerySchema,
} from "./schemas";

describe("Notes Schemas", () => {
  describe("createNoteSchema", () => {
    it("validates a full note with tags and markdown content", () => {
      const valid = {
        title: "System Architecture & Design Patterns",
        content: "# System Architecture\n\nModular monolith principles...",
        note_type: "concept",
        tags: ["Architecture", "NextJS", "architecture"], // contains duplicate case
        is_pinned: true,
      };

      const result = createNoteSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("System Architecture & Design Patterns");
        expect(result.data.note_type).toBe("concept");
        // Deduped and lowercased
        expect(result.data.tags).toEqual(["architecture", "nextjs"]);
        expect(result.data.is_pinned).toBe(true);
      }
    });

    it("defaults title to 'Untitled Note' if empty and tags to empty array", () => {
      const minimal = {};
      const result = createNoteSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Untitled Note");
        expect(result.data.content).toBe("");
        expect(result.data.tags).toEqual([]);
        expect(result.data.note_type).toBe("standard");
      }
    });

    it("enforces tag count limits", () => {
      const excessTags = Array.from({ length: 25 }, (_, i) => `tag-${i}`);
      const invalid = {
        title: "Too Many Tags",
        tags: excessTags,
      };

      const result = createNoteSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Cannot add more than 20 tags");
      }
    });
  });

  describe("updateNoteSchema", () => {
    it("validates partial note updates", () => {
      const valid = {
        title: "Refined Title",
        content: "Updated body",
        is_archived: true,
      };

      const result = updateNoteSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("createNoteLinkSchema", () => {
    it("validates target_note_id UUID and link_type", () => {
      const valid = {
        target_note_id: "123e4567-e89b-12d3-a456-426614174000",
        link_type: "references",
      };

      const result = createNoteLinkSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects non-uuid target", () => {
      const invalid = {
        target_note_id: "not-a-uuid",
      };

      const result = createNoteLinkSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("noteQuerySchema", () => {
    it("transforms boolean query strings", () => {
      const query = {
        search: "architecture",
        tag: "nextjs",
        is_pinned: "true",
        is_archived: "false",
      };

      const result = noteQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_pinned).toBe(true);
        expect(result.data.is_archived).toBe(false);
      }
    });
  });
});
