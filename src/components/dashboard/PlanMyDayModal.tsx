"use client";

import * as React from "react";
import {
  Calendar,
  Sparkles,
  X,
  CheckCircle2,
  Clock,
  FolderKanban,
  AlertCircle,
  HelpCircle,
  Trash2,
  ArrowRight,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { fireCelebrationConfetti } from "@/lib/ui/confetti";
import { useRouter } from "next/navigation";

export interface ParsedLineItem {
  raw: string;
  title: string;
  projectName?: string;
  priority?: "urgent" | "high" | "medium" | "low";
  estimatedMinutes?: number;
  scheduledTime?: string;
  tags: string[];
  notes?: string;
}

interface PlanMyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function parseDocketLine(line: string): ParsedLineItem | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;

  let text = trimmed;
  let projectName: string | undefined;
  let priority: "urgent" | "high" | "medium" | "low" | undefined;
  let estimatedMinutes: number | undefined;
  let scheduledTime: string | undefined;
  let notes: string | undefined;
  const tags: string[] = [];

  // Extract inline notes after //
  const noteMatch = text.match(/\/\/\s*(.+)$/);
  if (noteMatch) {
    notes = noteMatch[1].trim();
    text = text.replace(noteMatch[0], " ").trim();
  }

  // Extract @project (e.g. @NBD, @ACoV, @Fossil, @Friday)
  const projectMatch = text.match(/(?:^|\s)@([a-zA-Z0-9_\-]+)/);
  if (projectMatch) {
    projectName = projectMatch[1];
    text = text.replace(projectMatch[0], " ");
  }

  // Extract !priority (e.g. !urgent, !high, !med, !low)
  const prioMatch = text.match(/(?:^|\s)!(urgent|high|med|medium|low)\b/i);
  if (prioMatch) {
    const rawPrio = prioMatch[1].toLowerCase();
    priority = rawPrio === "med" ? "medium" : (rawPrio as "urgent" | "high" | "medium" | "low");
    text = text.replace(prioMatch[0], " ");
  }

  // Extract ~duration (e.g. ~45m, ~1h)
  const durMatch = text.match(/(?:^|\s)~(\d+)(m|h)?\b/i);
  if (durMatch) {
    const val = parseInt(durMatch[1], 10);
    const unit = durMatch[2]?.toLowerCase();
    estimatedMinutes = unit === "h" ? val * 60 : val;
    text = text.replace(durMatch[0], " ");
  }

  // Extract ^time (e.g. ^10:00, ^14:30)
  const timeMatch = text.match(/(?:^|\s)\^([0-9]{1,2}:[0-9]{2}|today|tomorrow)\b/i);
  if (timeMatch) {
    scheduledTime = timeMatch[1];
    text = text.replace(timeMatch[0], " ");
  }

  // Extract #tags
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-]+)/g;
  let tMatch;
  while ((tMatch = tagRegex.exec(text)) !== null) {
    tags.push(tMatch[1]);
  }
  text = text.replace(tagRegex, " ");

  const cleanTitle = text.replace(/\s+/g, " ").trim();
  if (!cleanTitle) return null;

  return {
    raw: line,
    title: cleanTitle,
    projectName,
    priority,
    estimatedMinutes,
    scheduledTime,
    tags,
    notes,
  };
}

export function PlanMyDayModal({
  isOpen,
  onClose,
  onSuccess,
}: PlanMyDayModalProps) {
  const router = useRouter();
  // Starts clean and empty as requested
  const [dumpText, setDumpText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Parse lines reactively
  const parsedItems: ParsedLineItem[] = React.useMemo(() => {
    return dumpText
      .split("\n")
      .map(parseDocketLine)
      .filter((it): it is ParsedLineItem => it !== null);
  }, [dumpText]);

  const handlePopulate = async () => {
    if (parsedItems.length === 0) {
      toast.error("Please enter at least one task in the dump box.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/day/plan/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: parsedItems,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to batch create tasks");
      }

      fireCelebrationConfetti();
      toast.success(`Populated ${parsedItems.length} tasks into today's docket.`);
      setDumpText("");
      onSuccess?.();
      router.refresh();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving daily plan";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col overflow-hidden text-[var(--foreground)]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#F5EBE1] dark:bg-[#2C1C15] flex items-center justify-center text-[#A84A28] dark:text-[#E87A54]">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
                  Plan My Day
                </h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Dump tasks for today using rapid @! natural syntax.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Clickable Guide to Separate Window */}
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
                title="Open Syntax Language Guide"
              >
                <HelpCircle className="h-3.5 w-3.5 text-[#E05B27]" />
                <span>Syntax Guide</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body: Clean Single Column Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span className="font-mono text-[11px] uppercase tracking-wider">
                  Task Dump (One per line)
                </span>
                {dumpText && (
                  <button
                    type="button"
                    onClick={() => setDumpText("")}
                    className="text-[11px] text-[var(--muted-foreground)] hover:text-rose-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <textarea
                ref={textareaRef}
                rows={5}
                value={dumpText}
                onChange={(e) => setDumpText(e.target.value)}
                placeholder="e.g. Architecture review @NBD !urgent ~45m ^10:00&#10;Write integration tests @ACoV !high ~30m&#10;Knowledge persistence sync @Fossil ~45m&#10;Weekly review @Friday !med"
                className="w-full p-3.5 text-xs font-mono rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 focus:outline-none focus:ring-1 focus:ring-[#E05B27] resize-none leading-relaxed"
                autoFocus
              />
            </div>

            {/* Minimalist, Quiet Docket Preview (Only when items exist) */}
            {parsedItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)]">
                  <span>Docket Preview ({parsedItems.length} items ready)</span>
                  <span className="text-[10px] font-mono">Today</span>
                </div>

                <div className="space-y-1 divide-y divide-[var(--border)]/40 rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-2">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-1 text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted-foreground)] shrink-0" />
                        <span className="text-xs text-[var(--foreground)] truncate font-medium">
                          {item.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Soft Project Badge */}
                        {item.projectName && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5EBE1] dark:bg-[#2C1C15] text-[#A84A28] dark:text-[#E87A54] font-medium">
                            @{item.projectName}
                          </span>
                        )}

                        {/* Soft Priority Text */}
                        {item.priority && (
                          <span
                            className={`text-[10px] font-mono capitalize ${
                              item.priority === "urgent"
                                ? "text-rose-600 dark:text-rose-400 font-semibold"
                                : item.priority === "high"
                                ? "text-amber-600 dark:text-amber-400 font-semibold"
                                : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            !{item.priority}
                          </span>
                        )}

                        {/* Duration estimate */}
                        {item.estimatedMinutes && (
                          <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                            ~{item.estimatedMinutes}m
                          </span>
                        )}

                        {/* Scheduled time */}
                        {item.scheduledTime && (
                          <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                            ^{item.scheduledTime}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-between shrink-0">
            <span className="text-xs text-[var(--muted-foreground)] font-mono">
              {parsedItems.length > 0 ? `${parsedItems.length} tasks ready` : "Type tasks above"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting || parsedItems.length === 0}
                onClick={handlePopulate}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#E05B27] hover:bg-[#C94D1D] active:scale-95 text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                {isSubmitting ? "Populating..." : "Populate Today's Schedule"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Syntax Guide Window / Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 shadow-2xl text-[var(--foreground)] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#E05B27]" />
                <h3 className="text-sm font-semibold">@! Syntax Guide &amp; Cheat Sheet</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <p className="text-[var(--muted-foreground)]">
                Each line in the dump box represents a task. Use these soft tokens to quickly route and schedule tasks:
              </p>

              {/* Token Table */}
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-[#A84A28] dark:text-[#E87A54]">@project</span>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-sans mt-0.5">
                      Assigns to an active project
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#F5EBE1] dark:bg-[#2C1C15] text-[#A84A28] dark:text-[#E87A54] text-[10px]">
                    @NBD, @ACoV, @Fossil, @Friday
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">!priority</span>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-sans mt-0.5">
                      Sets execution priority
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    !urgent, !high, !med, !low
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">~duration</span>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-sans mt-0.5">
                      Estimated focus duration
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    ~25m, ~45m, ~1h
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">^time</span>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-sans mt-0.5">
                      Scheduled time of day
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    ^10:00, ^14:30, ^today
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-[var(--foreground)]">// note</span>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-sans mt-0.5">
                      Appends additional notes to the task
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    // deliver draft by evening
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
