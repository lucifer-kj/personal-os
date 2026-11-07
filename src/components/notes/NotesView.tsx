"use client";

import * as React from "react";
import { Note, NoteWithLinks } from "@/modules/notes/types";
import { Project } from "@/modules/projects/types";
import { Task } from "@/modules/tasks/types";
import { NoteSidebar } from "./NoteSidebar";
import { NoteEditor } from "./NoteEditor";

interface NotesViewProps {
  initialNotes?: Note[];
  initialTags?: string[];
  initialProjects?: Project[];
  initialTasks?: Task[];
}

export function NotesView({
  initialNotes = [],
  initialTags = [],
  initialProjects = [],
  initialTasks = [],
}: NotesViewProps) {
  const [notes, setNotes] = React.useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = React.useState<NoteWithLinks | null>(
    (initialNotes[0] as NoteWithLinks) || null
  );
  const [availableTags, setAvailableTags] = React.useState<string[]>(initialTags);
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [filterMode, setFilterMode] = React.useState<"all" | "pinned" | "archived">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mobileShowEditor, setMobileShowEditor] = React.useState(false);

  // Fetch full details (with links) when selected note changes
  const fetchNoteDetails = React.useCallback(async (noteId: string) => {
    try {
      const res = await fetch(`/api/v1/notes/${noteId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSelectedNote(json.data);
        }
      }
    } catch {
      // Keep existing
    }
  }, []);

  // Fetch initial note links on mount if note exists
  React.useEffect(() => {
    let isMounted = true;
    if (initialNotes[0]?.id) {
      fetch(`/api/v1/notes/${initialNotes[0].id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (isMounted && j?.data) setSelectedNote(j.data);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [initialNotes]);

  // Fetch tags
  const refreshTags = React.useCallback(() => {
    fetch("/api/v1/notes/tags")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.data)) {
          setAvailableTags(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch notes when filter or search changes
  React.useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();

    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (activeTag) params.set("tag", activeTag);
    if (filterMode === "pinned") params.set("is_pinned", "true");
    if (filterMode === "archived") params.set("is_archived", "true");

    fetch(`/api/v1/notes?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json && Array.isArray(json.data)) {
          setNotes(json.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [searchQuery, activeTag, filterMode]);

  // Handlers
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note as NoteWithLinks);
    fetchNoteDetails(note.id);
    setMobileShowEditor(true);
  };

  const handleNewNote = async () => {
    try {
      const res = await fetch("/api/v1/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
          tags: activeTag ? [activeTag] : [],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const newNote = json.data;
        setNotes((prev) => [newNote, ...prev]);
        setSelectedNote(newNote);
        setMobileShowEditor(true);
        refreshTags();
      }
    } catch {
      // Ignore
    }
  };

  const handleUpdateNote = async (
    id: string,
    payload: {
      title?: string;
      content?: string;
      tags?: string[];
      project_id?: string | null;
      task_id?: string | null;
    }
  ) => {
    const res = await fetch(`/api/v1/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      const updated = json.data;
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setSelectedNote((prev) =>
        prev && prev.id === id ? { ...prev, ...updated } : prev
      );
      if (payload.tags) refreshTags();
    }
  };

  const handleDeleteNote = async (id: string) => {
    const res = await fetch(`/api/v1/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      const remaining = notes.filter((n) => n.id !== id);
      setNotes(remaining);
      setSelectedNote(remaining[0] ? (remaining[0] as NoteWithLinks) : null);
      setMobileShowEditor(false);
      refreshTags();
    }
  };

  const handleTogglePin = async (id: string) => {
    const res = await fetch(`/api/v1/notes/${id}/pin`, { method: "POST" });
    if (res.ok) {
      const json = await res.json();
      const updated = json.data;
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setSelectedNote((prev) =>
        prev && prev.id === id ? { ...prev, is_pinned: updated.is_pinned } : prev
      );
    }
  };

  const handleToggleArchive = async (id: string) => {
    const res = await fetch(`/api/v1/notes/${id}/archive`, { method: "POST" });
    if (res.ok) {
      const json = await res.json();
      const updated = json.data;
      if (filterMode !== "archived") {
        const remaining = notes.filter((n) => n.id !== id);
        setNotes(remaining);
        setSelectedNote(remaining[0] ? (remaining[0] as NoteWithLinks) : null);
      } else {
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      }
    }
  };

  const handleLinkNote = async (sourceId: string, targetId: string) => {
    const res = await fetch(`/api/v1/notes/${sourceId}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_note_id: targetId }),
    });

    if (res.ok) {
      fetchNoteDetails(sourceId);
    }
  };

  const handleUnlinkNote = async (sourceId: string, targetId: string) => {
    const res = await fetch(
      `/api/v1/notes/${sourceId}/links?target_note_id=${targetId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      fetchNoteDetails(sourceId);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-[calc(100vh-4rem)] border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-xs">
      {/* Sidebar List (hidden on mobile when editor is active) */}
      <div className={`${mobileShowEditor ? "hidden lg:flex" : "flex"} w-full lg:w-80`}>
        <NoteSidebar
          notes={notes}
          selectedNoteId={selectedNote?.id || null}
          onSelectNote={handleSelectNote}
          onNewNote={handleNewNote}
          activeTag={activeTag}
          onSelectTag={setActiveTag}
          availableTags={availableTags}
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Editor & Preview Area */}
      <div
        className={`${
          !mobileShowEditor ? "hidden lg:flex" : "flex"
        } flex-1 flex-col`}
      >
        <NoteEditor
          note={selectedNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePin}
          onToggleArchive={handleToggleArchive}
          onLinkNote={handleLinkNote}
          onUnlinkNote={handleUnlinkNote}
          allNotes={notes.map((n) => ({ id: n.id, title: n.title }))}
          projects={initialProjects}
          tasks={initialTasks}
          onBackMobile={() => setMobileShowEditor(false)}
        />
      </div>
    </div>
  );
}
