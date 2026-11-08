"use client";

import * as React from "react";
import { Note } from "@/modules/notes/types";
import {
  Search,
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
  onNewNote: _onNewNote,
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
    <aside className="w-full flex flex-col space-y-3 shrink-0">
      {/* 1. Filter Mode Tabs matching Reference Image 1 */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] pb-2 text-xs">
        <button
          type="button"
          onClick={() => onFilterModeChange("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            filterMode === "all"
              ? "bg-[#241C18] text-[#F4EFEA] border border-[#3D261C] font-semibold shadow-2xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          All ({notes.length})
        </button>
        <button
          type="button"
          onClick={() => onFilterModeChange("pinned")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            filterMode === "pinned"
              ? "bg-[#241C18] text-[#F4EFEA] border border-[#3D261C] font-semibold shadow-2xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Pinned ({pinnedNotes.length})
        </button>
        <button
          type="button"
          onClick={() => onFilterModeChange("archived")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            filterMode === "archived"
              ? "bg-[#241C18] text-[#F4EFEA] border border-[#3D261C] font-semibold shadow-2xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Archive
        </button>
      </div>

      {/* 2. Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes or #tags..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>

      {/* 3. Tag Taxonomy Chips */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {activeTag && (
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
            >
              Clear #{activeTag} ✕
            </button>
          )}
          {availableTags.slice(0, 6).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(tag === activeTag ? null : tag)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono transition-colors cursor-pointer ${
                activeTag === tag
                  ? "bg-[#E05B27] text-white font-semibold"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* 4. Note Cards Stream */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[calc(100vh-16rem)] pr-0.5 scrollbar-thin">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--muted-foreground)] rounded-2xl border border-dashed border-[var(--border)]">
            No notes found.
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && filterMode !== "archived" && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                  <Pin className="h-3 w-3 text-[#E05B27]" />
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
              <div className="space-y-2">
                {pinnedNotes.length > 0 && filterMode !== "archived" && (
                  <div className="flex items-center gap-1.5 px-1 pt-1 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                    <FileText className="h-3 w-3" />
                    <span>All Notes</span>
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
    return note.content
      .replace(/[#*`~_>[\]()]/g, "")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 110);
  }, [note.content]);

  const dateFormatted = React.useMemo(() => {
    const d = new Date(note.updated_at);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [note.updated_at]);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl cursor-pointer transition-all border flex flex-col gap-2 ${
        isSelected
          ? "bg-[#1E1916] border-[#E05B27]/50 shadow-2xs"
          : "bg-[var(--card)] border-[var(--border)] hover:border-[#3D261C] hover:bg-[var(--muted)]/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={`font-sans font-semibold text-xs leading-snug line-clamp-1 ${
            isSelected ? "text-[#F4EFEA]" : "text-[var(--foreground)]"
          }`}
        >
          {note.title || "Untitled Note"}
        </h3>
        {note.is_pinned && (
          <Pin className="h-3 w-3 text-[#E05B27] shrink-0 fill-[#E05B27]" />
        )}
      </div>

      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
        {previewText}
      </p>

      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[var(--muted-foreground)]">
        <span>{dateFormatted}</span>

        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            {note.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-[var(--muted)] border border-[var(--border)] px-2 py-0.2 text-[9px] text-[var(--muted-foreground)]"
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
