"use client";

import * as React from "react";
import { NoteWithLinks, NoteType } from "@/modules/notes/types";
import { Project } from "@/modules/projects/types";
import { Task } from "@/modules/tasks/types";
import { Button } from "@/components/ui/button";
import {
  Pin,
  Archive,
  Trash2,
  Loader2,
  Columns,
  Eye,
  Edit3,
  Link2,
  Plus,
  X,
  FolderKanban,
  CheckSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface NoteEditorProps {
  note: NoteWithLinks | null;
  onUpdateNote: (
    id: string,
    payload: {
      title?: string;
      content?: string;
      note_type?: NoteType;
      project_id?: string | null;
      task_id?: string | null;
      tags?: string[];
      is_pinned?: boolean;
      is_archived?: boolean;
    }
  ) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onTogglePin: (id: string) => Promise<void>;
  onToggleArchive: (id: string) => Promise<void>;
  onLinkNote: (sourceId: string, targetId: string) => Promise<void>;
  onUnlinkNote: (sourceId: string, targetId: string) => Promise<void>;
  allNotes: { id: string; title: string }[];
  projects?: Project[];
  tasks?: Task[];
  onBackMobile?: () => void;
}

export function NoteEditor({
  note,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
  onToggleArchive,
  onLinkNote,
  onUnlinkNote,
  allNotes,
  projects = [],
  tasks = [],
  onBackMobile,
}: NoteEditorProps) {
  // Local editable state
  const [title, setTitle] = React.useState(note?.title || "");
  const [content, setContent] = React.useState(note?.content || "");
  const [noteType, setNoteType] = React.useState<NoteType>(note?.note_type || "standard");
  const [projectId, setProjectId] = React.useState<string>(note?.project_id || "");
  const [taskId, setTaskId] = React.useState<string>(note?.task_id || "");
  const [tags, setTags] = React.useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = React.useState("");

  // UI state
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "unsaved">("saved");
  const [viewMode, setViewMode] = React.useState<"edit" | "preview" | "split">("split");
  const [selectedLinkTargetId, setSelectedLinkTargetId] = React.useState("");

  // Sync state when note prop changes
  const [prevNoteId, setPrevNoteId] = React.useState<string | null>(null);
  const currentNoteId = note?.id ?? null;

  if (currentNoteId !== prevNoteId) {
    setPrevNoteId(currentNoteId);
    if (note) {
      setTitle(note.title ?? "");
      setContent(note.content ?? "");
      setNoteType(note.note_type ?? "standard");
      setProjectId(note.project_id ?? "");
      setTaskId(note.task_id ?? "");
      setTags(note.tags ?? []);
      setSaveStatus("saved");
    }
  }

  // Debounced autosave
  React.useEffect(() => {
    if (!note) return;

    // Check if anything changed
    const hasChanged =
      title !== note.title ||
      content !== (note.content || "") ||
      noteType !== note.note_type ||
      projectId !== (note.project_id || "") ||
      taskId !== (note.task_id || "") ||
      JSON.stringify(tags) !== JSON.stringify(note.tags || []);

    if (!hasChanged) return;

    const timer = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await onUpdateNote(note.id, {
          title,
          content,
          note_type: noteType,
          project_id: projectId || null,
          task_id: taskId || null,
          tags,
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [note, title, content, noteType, projectId, taskId, tags, onUpdateNote]);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--background)] min-h-[500px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-3">
          <Edit3 className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-lg font-medium text-[var(--foreground)]">
          No Note Selected
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] max-w-sm mt-1">
          Select an existing note from the sidebar or click &quot;New Note&quot; to begin writing.
        </p>
      </div>
    );
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().toLowerCase().replace(/^#/, "");
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setSaveStatus("unsaved");
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setSaveStatus("unsaved");
  };

  const handleAddLink = async () => {
    if (!selectedLinkTargetId || selectedLinkTargetId === note.id) return;
    await onLinkNote(note.id, selectedLinkTargetId);
    setSelectedLinkTargetId("");
  };

  return (
    <div className="flex-1 flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs min-h-[600px]">
      {/* Top Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/40 p-3 sm:px-6">
        <div className="flex items-center gap-2">
          {onBackMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackMobile}
              className="lg:hidden text-xs h-8 px-2"
            >
              ← Back
            </Button>
          )}

          {/* Autosave status indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--muted-foreground)]">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--primary)]" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                <span>Unsaved changes</span>
              </>
            )}
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mode Switcher */}
          <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              title="Edit Markdown"
              className={`rounded px-2 py-1 flex items-center gap-1 ${
                viewMode === "edit"
                  ? "bg-[var(--card)] text-[var(--foreground)] font-semibold shadow-2xs"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              title="Preview Formatted Markdown"
              className={`rounded px-2 py-1 flex items-center gap-1 ${
                viewMode === "preview"
                  ? "bg-[var(--card)] text-[var(--foreground)] font-semibold shadow-2xs"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              title="Side-by-side Editor & Preview"
              className={`hidden md:flex rounded px-2 py-1 items-center gap-1 ${
                viewMode === "split"
                  ? "bg-[var(--card)] text-[var(--foreground)] font-semibold shadow-2xs"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              <Columns className="h-3 w-3" />
              <span>Split</span>
            </button>
          </div>

          {/* Pin Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePin(note.id)}
            title={note.is_pinned ? "Unpin Note" : "Pin Note"}
            className={`h-8 w-8 p-0 ${
              note.is_pinned
                ? "text-[var(--primary)] bg-[var(--primary)]/10"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            <Pin className="h-3.5 w-3.5" />
          </Button>

          {/* Archive Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleArchive(note.id)}
            title={note.is_archived ? "Restore Note" : "Archive Note"}
            className={`h-8 w-8 p-0 ${
              note.is_archived
                ? "text-amber-600 bg-amber-500/10"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this note?")) {
                onDeleteNote(note.id);
              }
            }}
            title="Delete Note"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Note Title & Metadata Bar */}
      <div className="p-4 sm:px-8 border-b border-[var(--border)] bg-[var(--card)]/20 space-y-3">
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveStatus("unsaved");
          }}
          placeholder="Untitled Note"
          className="w-full text-2xl sm:text-3xl font-serif font-medium bg-transparent border-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-hidden"
        />

        {/* Metadata Fields Strip */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
          {/* Note Type */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px]">Type:</span>
            <select
              value={noteType}
              onChange={(e) => {
                setNoteType(e.target.value as NoteType);
                setSaveStatus("unsaved");
              }}
              className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-[var(--foreground)]"
            >
              <option value="standard">Standard</option>
              <option value="meeting">Meeting</option>
              <option value="concept">Concept</option>
              <option value="project">Project</option>
              <option value="reference">Reference</option>
            </select>
          </div>

          {/* Project Link */}
          {projects.length > 0 && (
            <div className="flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5" />
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setSaveStatus("unsaved");
                }}
                className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-[var(--foreground)]"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Link */}
          {tasks.length > 0 && (
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" />
              <select
                value={taskId}
                onChange={(e) => {
                  setTaskId(e.target.value);
                  setSaveStatus("unsaved");
                }}
                className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-[var(--foreground)]"
              >
                <option value="">No Task</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags list & Tag input */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-mono text-[var(--foreground)]"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-red-500"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="+ add tag"
              className="w-20 rounded bg-transparent px-1.5 py-0.5 text-[11px] font-mono text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            className={`flex-1 p-4 sm:p-8 overflow-y-auto ${
              viewMode === "split" ? "border-r border-[var(--border)]" : ""
            }`}
          >
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setSaveStatus("unsaved");
              }}
              placeholder="Write your note in Markdown... Use [[Note Title]] to link concepts."
              className="w-full h-full min-h-[400px] resize-none bg-transparent font-sans text-sm sm:text-base leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-hidden"
            />
          </div>
        )}

        {/* Preview Pane */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[var(--card)]/10">
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>

      {/* Linked Notes Drawer Footer */}
      <div className="border-t border-[var(--border)] bg-[var(--card)]/60 p-4 sm:px-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-[var(--primary)]" />
            <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
              Knowledge Links & References
            </h4>
          </div>

          {/* Add Link Control */}
          <div className="flex items-center gap-2">
            <select
              value={selectedLinkTargetId}
              onChange={(e) => setSelectedLinkTargetId(e.target.value)}
              className="rounded border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-xs text-[var(--foreground)]"
            >
              <option value="">Link to another note...</option>
              {allNotes
                .filter((n) => n.id !== note.id)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title || "Untitled Note"}
                  </option>
                ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddLink}
              disabled={!selectedLinkTargetId}
              className="h-7 text-xs px-2.5 gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Link
            </Button>
          </div>
        </div>

        {/* Existing Links */}
        <div className="flex flex-wrap gap-4 text-xs">
          {/* Outward references */}
          {note.outward_links && note.outward_links.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                References:
              </span>
              {note.outward_links.map((link) => (
                <span
                  key={link.id}
                  className="inline-flex items-center gap-1 rounded bg-[var(--muted)]/60 px-2 py-0.5 text-xs text-[var(--foreground)] border border-[var(--border)]"
                >
                  <Link2 className="h-2.5 w-2.5 opacity-60" />
                  {link.target_note?.title || "Untitled Note"}
                  <button
                    type="button"
                    onClick={() => onUnlinkNote(note.id, link.target_note_id)}
                    className="hover:text-red-500 ml-0.5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Inward backlinks */}
          {note.inward_links && note.inward_links.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                Backlinks:
              </span>
              {note.inward_links.map((link) => (
                <span
                  key={link.id}
                  className="inline-flex items-center gap-1 rounded bg-[var(--accent)]/40 px-2 py-0.5 text-xs text-[var(--foreground)] border border-[var(--border)]"
                >
                  ← {link.source_note?.title || "Untitled Note"}
                </span>
              ))}
            </div>
          )}

          {(!note.outward_links || note.outward_links.length === 0) &&
            (!note.inward_links || note.inward_links.length === 0) && (
              <span className="text-xs text-[var(--muted-foreground)]">
                No note links established yet. Connect concepts to form a knowledge graph.
              </span>
            )}
        </div>
      </div>
    </div>
  );
}

/**
 * Modern, rich GitHub-Flavored Markdown renderer for note previews
 */
function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <div className="text-xs text-[var(--muted-foreground)] italic">
        Preview will appear here as you type Markdown...
      </div>
    );
  }

  return (
    <div className="text-sm text-[var(--foreground)] leading-relaxed font-sans max-w-2xl prose prose-neutral dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-[var(--foreground)] border-b border-[var(--border)] pb-1.5 mt-5 mb-2.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-serif font-semibold tracking-tight text-[var(--foreground)] mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-serif font-semibold text-[var(--foreground)] mt-3 mb-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--primary)] pl-3.5 italic text-[var(--muted-foreground)] my-3">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-3 pl-1 text-[var(--foreground)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-3 pl-1 text-[var(--foreground)]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block bg-[var(--muted)]/60 text-[var(--foreground)] p-3 rounded-lg text-xs font-mono overflow-x-auto border border-[var(--border)] my-2">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-[var(--muted)]/60 text-[var(--foreground)] px-1.5 py-0.5 rounded text-xs font-mono border border-[var(--border)]/50">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full text-left text-xs border-collapse border border-[var(--border)] rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[var(--border)] bg-[var(--muted)]/40 p-2 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[var(--border)] p-2">{children}</td>
          ),
          input: ({ checked }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 rounded border-[var(--border)] text-[var(--primary)] align-middle cursor-default"
            />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 dark:text-sky-400 underline hover:opacity-80"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
