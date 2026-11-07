import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { NotesView } from "./NotesView";
import { Note } from "@/modules/notes/types";

describe("NotesView component", () => {
  const mockNotes: Note[] = [
    {
      id: "note-1",
      user_id: "user-1",
      title: "Architecture Guidelines",
      content: "# Guidelines\n\n- Modular boundaries\n- TDD workflow",
      content_format: "markdown",
      note_type: "concept",
      project_id: null,
      task_id: null,
      tags: ["architecture", "guidelines"],
      is_pinned: true,
      is_archived: false,
      created_at: "2026-11-06T10:00:00Z",
      updated_at: "2026-11-06T10:00:00Z",
      deleted_at: null,
    },
    {
      id: "note-2",
      user_id: "user-1",
      title: "Meeting Action Items",
      content: "- [x] Update schema\n- [ ] Deploy v1",
      content_format: "markdown",
      note_type: "meeting",
      project_id: null,
      task_id: null,
      tags: ["meeting"],
      is_pinned: false,
      is_archived: false,
      created_at: "2026-11-06T11:00:00Z",
      updated_at: "2026-11-06T11:00:00Z",
      deleted_at: null,
    },
  ];

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (url.includes("/api/v1/notes/tags")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: ["architecture", "meeting"] }),
        });
      }

      if (url.includes("/api/v1/notes/note-2")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                ...mockNotes[1],
                outward_links: [],
                inward_links: [],
              },
            }),
        });
      }

      if (url.includes("/api/v1/notes/note-1")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                ...mockNotes[0],
                outward_links: [
                  {
                    id: "link-1",
                    source_note_id: "note-1",
                    target_note_id: "note-2",
                    link_type: "references",
                    target_note: { id: "note-2", title: "Meeting Action Items" },
                  },
                ],
                inward_links: [],
              },
            }),
        });
      }

      if (opts?.method === "POST" && url.endsWith("/api/v1/notes")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                id: "note-new",
                user_id: "user-1",
                title: "New Fresh Note",
                content: "",
                content_format: "markdown",
                note_type: "standard",
                project_id: null,
                task_id: null,
                tags: [],
                is_pinned: false,
                is_archived: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
              },
            }),
        });
      }

      if (url.includes("/api/v1/notes")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockNotes }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    });
  });

  it("renders notes sidebar, tag chips, and loads active note editor", async () => {
    await act(async () => {
      render(
        <NotesView
          initialNotes={mockNotes}
          initialTags={["architecture", "meeting"]}
        />
      );
    });

    expect(screen.getByRole("button", { name: /new note/i })).toBeDefined();
    expect(screen.getAllByText("Architecture Guidelines").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Meeting Action Items").length).toBeGreaterThan(0);
    expect(screen.getAllByText("#architecture").length).toBeGreaterThan(0);
  });

  it("switches selected note when clicked in the sidebar", async () => {
    await act(async () => {
      render(
        <NotesView
          initialNotes={mockNotes}
          initialTags={["architecture", "meeting"]}
        />
      );
    });

    const secondNoteHeading = screen.getByRole("heading", {
      name: "Meeting Action Items",
    });
    await act(async () => {
      fireEvent.click(secondNoteHeading);
    });

    const titleInput = screen.getByDisplayValue("Meeting Action Items");
    expect(titleInput).toBeDefined();
  });

  it("renders preview formatted markdown elements", async () => {
    await act(async () => {
      render(
        <NotesView
          initialNotes={mockNotes}
          initialTags={["architecture", "meeting"]}
        />
      );
    });

    expect(screen.getByText("Guidelines")).toBeDefined();
    expect(screen.getByText("Modular boundaries")).toBeDefined();
  });

  it("creates a new note when clicking New Note", async () => {
    await act(async () => {
      render(
        <NotesView
          initialNotes={mockNotes}
          initialTags={["architecture", "meeting"]}
        />
      );
    });

    const newBtn = screen.getByRole("button", { name: /new note/i });
    await act(async () => {
      fireEvent.click(newBtn);
    });

    expect(screen.getByDisplayValue("New Fresh Note")).toBeDefined();
  });
});
