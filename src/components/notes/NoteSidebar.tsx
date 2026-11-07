"use client";

import * as React from "react";
import { Note } from "@/modules/notes/types";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Pin,
  FileText,
} from "lucide-react";

interface NoteSidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  availableTags: string[];
  filterMode: "all" | "pinned" | "archived";
  onFilterModeChange: (mode: "all" | "pinned" | "archived") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function NoteSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  activeTag,
  onSelectTag,
  availableTags,
  filterMode,
  onFilterModeChange,
  searchQuery,
  onSearchChange,
}: NoteSidebarProps) {
  // Pinned vs Regular
  const pinnedNotes = React.useMemo(
    () => notes.filter((n) => n.is_pinned),
    [notes]
  );
  const otherNotes = React.useMemo(
    () => notes.filter((n) => !n.is_pinned),
    [notes]
  );

  return (
    <aside className="w-full lg:w-80 border-r border-[var(--border)] bg-[var(--card)]/50 flex flex-col shrink-0 min-h-[580px] lg:min-h-[calc(100vh-4rem)]">
      {/* Top Search & Create Bar */}
      <div className="p-4 border-b border-[var(--border)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="font-serif text-lg font-medium text-[var(--foreground)]">
              Notes
            </h2>
          </div>
          <Button
            size="sm"
            onClick={onNewNote}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            New Note
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes or #tags..."
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-8 pr-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Filter Mode Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onFilterModeChange("all")}
            className={`flex-1 rounded py-1 text-center transition-all ${
              filterMode === "all"
                ? "bg-[var(--card)] font-medium text-[var(--foreground)] shadow-2xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            All ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterModeChange("pinned")}
            className={`flex-1 rounded py-1 text-center transition-all ${
              filterMode === "pinned"
                ? "bg-[var(--card)] font-medium text-[var(--foreground)] shadow-2xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Pinned ({pinnedNotes.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterModeChange("archived")}
            className={`flex-1 rounded py-1 text-center transition-all ${
              filterMode === "archived"
                ? "bg-[var(--card)] font-medium text-[var(--foreground)] shadow-2xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Archive
          </button>
        </div>

        {/* Tag Taxonomy Chips */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {activeTag && (
              <button
                type="button"
                onClick={() => onSelectTag(null)}
                className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Clear #{activeTag} ✕
              </button>
            )}
            {availableTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(tag === activeTag ? null : tag)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono transition-colors ${
                  activeTag === tag
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold"
                    : "bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Note Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
            No notes found. Click &quot;New Note&quot; to capture your thoughts.
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && filterMode !== "archived" && (
              <div>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--muted)]/10 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                  <Pin className="h-3 w-3" />
                  <span>Pinned</span>
                </div>
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isSelected={selectedNoteId === note.id}
                    onSelect={() => onSelectNote(note)}
                  />
                ))}
              </div>
            )}

            {/* Other Notes Section */}
            {otherNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && filterMode !== "archived" && (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--muted)]/10 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                    <FileText className="h-3 w-3" />
                    <span>Notes</span>
                  </div>
                )}
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isSelected={selectedNoteId === note.id}
                    onSelect={() => onSelectNote(note)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function NoteCard({
  note,
  isSelected,
  onSelect,
}: {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const previewText = React.useMemo(() => {
    if (!note.content) return "Empty note";
    // Strip markdown formatting for preview
    return note.content
      .replace(/[#*`~_>[\]()]/g, "")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 100);
  }, [note.content]);

  const dateFormatted = React.useMemo(() => {
    const d = new Date(note.updated_at);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, [note.updated_at]);

  return (
    <div
      onClick={onSelect}
      className={`p-4 cursor-pointer transition-colors flex flex-col gap-1.5 ${
        isSelected
          ? "bg-[var(--accent)]/50 border-l-2 border-l-[var(--primary)]"
          : "hover:bg-[var(--accent)]/20"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-serif font-medium text-sm text-[var(--foreground)] truncate">
          {note.title || "Untitled Note"}
        </h3>
        {note.is_pinned && (
          <Pin className="h-3 w-3 text-[var(--primary)] shrink-0" />
        )}
      </div>

      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
        {previewText}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-mono text-[var(--muted-foreground)]">
        <span>{dateFormatted}</span>

        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden">
            {note.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[9px] text-[var(--muted-foreground)]"
              >
                #{t}
              </span>
            ))}
            {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
