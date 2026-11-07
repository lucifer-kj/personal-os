"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  CheckSquare,
  Folder,
  FileText,
  Inbox,
  Flame,
  Timer,
  Calendar,
  Compass,
  ArrowRight,
  X,
  Sparkles,
  Share2,
  Radio,
} from "lucide-react";
import {
  DEFAULT_NAVIGATION_COMMANDS,
  DEFAULT_QUICK_ACTIONS,
} from "@/modules/search/search.service";
import { SearchResultItem } from "@/modules/search/types";

interface CommandPaletteProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({
  isOpen: controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const setOpen = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setQuery("");
        setResults([]);
        setIsLoading(false);
      }
      if (onOpenChange) {
        onOpenChange(open);
      } else {
        setUncontrolledOpen(open);
      }
    },
    [onOpenChange]
  );

  // Global shortcut (Cmd+K / Ctrl+K) and custom event listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!isOpen);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setOpen(false);
      }
    };

    const handleCustomTrigger = () => {
      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("personal-os:command-palette", handleCustomTrigger);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("personal-os:command-palette", handleCustomTrigger);
    };
  }, [isOpen, setOpen]);

  // Fetch search results on query change
  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/v1/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((json) => {
          setResults(json.data || []);
          setIsLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Search error:", err);
            setIsLoading(false);
          }
        });
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelectNavigation = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const handleSelectAction = (actionId: string, url?: string) => {
    setOpen(false);
    if (actionId === "quick-capture") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("personal-os:quick-capture"));
      }
      return;
    }
    if (actionId === "state-preview") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("personal-os:state-preview"));
      }
      return;
    }
    if (url) {
      router.push(url);
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    setOpen(false);
    router.push(item.url);
  };

  if (!isOpen) return null;

  const tasks = results.filter((r) => r.type === "task");
  const projects = results.filter((r) => r.type === "project");
  const notes = results.filter((r) => r.type === "note");
  const habits = results.filter((r) => r.type === "habit");
  const inbox = results.filter((r) => r.type === "inbox");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 p-4 bg-black/40 backdrop-blur-xs"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="flex flex-col w-full h-full"
          shouldFilter={!query.trim()} // Use cmdk's local filter for default items, remote for search query
        >
          {/* Header & Search Input */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 bg-[var(--card)]">
            <Search className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={(val) => {
                setQuery(val);
                if (!val.trim()) {
                  setResults([]);
                  setIsLoading(false);
                }
              }}
              placeholder="Search tasks, notes, projects, or type a command..."
              className="w-full bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setIsLoading(false);
                }}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-block rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] border border-[var(--border)]">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <Command.List className="overflow-y-auto p-2 space-y-1 max-h-[60vh] scrollbar-thin">
            {isLoading && (
              <div className="flex items-center justify-center py-6 text-xs text-[var(--muted-foreground)] gap-2">
                <span className="h-3.5 w-3.5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                <span>Searching workstation...</span>
              </div>
            )}

            {!isLoading && query.trim() && results.length === 0 && (
              <Command.Empty className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                No matching items found for &ldquo;{query}&rdquo;
              </Command.Empty>
            )}

            {/* Remote Live Search Results */}
            {query.trim().length > 0 && (
              <>
                {tasks.length > 0 && (
                  <Command.Group
                    heading="Tasks"
                    className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1 font-semibold"
                  >
                    {tasks.map((task) => (
                      <Command.Item
                        key={task.id}
                        value={`task-${task.id}-${task.title}`}
                        onSelect={() => handleSelectResult(task)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckSquare className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <div className="truncate">
                            <span className="font-medium">{task.title}</span>
                            {task.subtitle && (
                              <span className="text-[11px] text-[var(--muted-foreground)] ml-2">
                                {task.subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                        {task.status && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] shrink-0">
                            {task.status}
                          </span>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {projects.length > 0 && (
                  <Command.Group
                    heading="Projects"
                    className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1 font-semibold"
                  >
                    {projects.map((proj) => (
                      <Command.Item
                        key={proj.id}
                        value={`project-${proj.id}-${proj.title}`}
                        onSelect={() => handleSelectResult(proj)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Folder className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                          <span className="font-medium truncate">{proj.title}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {notes.length > 0 && (
                  <Command.Group
                    heading="Notes"
                    className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1 font-semibold"
                  >
                    {notes.map((note) => (
                      <Command.Item
                        key={note.id}
                        value={`note-${note.id}-${note.title}`}
                        onSelect={() => handleSelectResult(note)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                          <span className="font-medium truncate">{note.title}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {habits.length > 0 && (
                  <Command.Group
                    heading="Habits"
                    className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1 font-semibold"
                  >
                    {habits.map((habit) => (
                      <Command.Item
                        key={habit.id}
                        value={`habit-${habit.id}-${habit.title}`}
                        onSelect={() => handleSelectResult(habit)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Flame className="h-3.5 w-3.5 shrink-0 text-orange-600" />
                          <span className="font-medium truncate">{habit.title}</span>
                        </div>
                        {habit.status && (
                          <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                            {habit.status}
                          </span>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {inbox.length > 0 && (
                  <Command.Group
                    heading="Inbox"
                    className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1 font-semibold"
                  >
                    {inbox.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`inbox-${item.id}-${item.title}`}
                        onSelect={() => handleSelectResult(item)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Inbox className="h-3.5 w-3.5 shrink-0 text-purple-600" />
                          <span className="font-medium truncate">{item.title}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </>
            )}

            {/* Quick Actions Group */}
            <Command.Group
              heading="Quick Actions"
              className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1 font-semibold"
            >
              {DEFAULT_QUICK_ACTIONS.map((action) => (
                <Command.Item
                  key={action.id}
                  value={`${action.title} ${action.keywords.join(" ")}`}
                  onSelect={() => handleSelectAction(action.actionId, action.url)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                    <div>
                      <span className="font-medium">{action.title}</span>
                      <span className="text-[11px] text-[var(--muted-foreground)] ml-2 hidden sm:inline">
                        {action.description}
                      </span>
                    </div>
                  </div>
                  {action.shortcut && (
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] shrink-0">
                      {action.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>

            {/* Navigation Group */}
            <Command.Group
              heading="Navigation"
              className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1 font-semibold"
            >
              {DEFAULT_NAVIGATION_COMMANDS.map((nav) => (
                <Command.Item
                  key={nav.id}
                  value={`${nav.title} ${nav.keywords.join(" ")}`}
                  onSelect={() => handleSelectNavigation(nav.url)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {nav.url === "/" && <Compass className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />}
                    {nav.url === "/tasks" && <CheckSquare className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                    {nav.url === "/projects" && <Folder className="h-3.5 w-3.5 shrink-0 text-amber-600" />}
                    {nav.url === "/calendar" && <Calendar className="h-3.5 w-3.5 shrink-0 text-sky-600" />}
                    {nav.url === "/notes" && <FileText className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
                    {nav.url === "/habits" && <Flame className="h-3.5 w-3.5 shrink-0 text-orange-600" />}
                    {nav.url === "/journal" && <Sparkles className="h-3.5 w-3.5 shrink-0 text-rose-600" />}
                    {nav.url === "/focus" && <Timer className="h-3.5 w-3.5 shrink-0 text-teal-600" />}
                    {nav.url === "/inbox" && <Inbox className="h-3.5 w-3.5 shrink-0 text-purple-600" />}
                    {nav.url === "/studio" && <Share2 className="h-3.5 w-3.5 shrink-0 text-indigo-600" />}
                    {nav.url === "/radar" && <Radio className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
                    <span className="font-medium">{nav.title}</span>
                  </div>
                  {nav.shortcut && (
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] shrink-0">
                      {nav.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer Shortcuts hint */}
          <div className="border-t border-[var(--border)] px-4 py-2 bg-[var(--card)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2">
              <span>Use</span>
              <kbd className="px-1 rounded bg-[var(--muted)] border border-[var(--border)] text-[9px] font-mono">↑</kbd>
              <kbd className="px-1 rounded bg-[var(--muted)] border border-[var(--border)] text-[9px] font-mono">↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Select</span>
              <kbd className="px-1 rounded bg-[var(--muted)] border border-[var(--border)] text-[9px] font-mono">↵</kbd>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
