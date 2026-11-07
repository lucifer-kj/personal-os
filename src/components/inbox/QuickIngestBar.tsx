"use client";

import * as React from "react";
import {
  Mic,
  MicOff,
  Plus,
  Layers,
  ArrowRight,
  Check,
  Calendar,
  AlertCircle,
  Clock,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseNaturalSyntax, ParsedNaturalSyntax } from "@/lib/parser/naturalSyntax";
import { parseBatchIngest } from "@/lib/parser/batchIngest";
import { useSpeechToText } from "@/lib/hooks/useSpeechToText";

interface QuickIngestBarProps {
  onItemCreated?: () => void;
  className?: string;
}

export function QuickIngestBar({ onItemCreated, className = "" }: QuickIngestBarProps) {
  const [isBatchMode, setIsBatchMode] = React.useState(false);
  const [singleInput, setSingleInput] = React.useState("");
  const [batchInput, setBatchInput] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Live parsed preview for single input
  const parsedSingle = React.useMemo<ParsedNaturalSyntax | null>(() => {
    if (!singleInput.trim()) return null;
    return parseNaturalSyntax(singleInput);
  }, [singleInput]);

  // Live parsed preview for batch input
  const parsedBatch = React.useMemo(() => {
    if (!batchInput.trim()) return [];
    return parseBatchIngest(batchInput);
  }, [batchInput]);

  // Speech-to-text integration
  const handleTranscriptChange = React.useCallback(
    (newTranscript: string) => {
      setSingleInput(newTranscript);
    },
    []
  );

  const { isSupported, isListening, toggleListening, error: speechError } =
    useSpeechToText({
      onTranscriptChange: handleTranscriptChange,
    });

  // Handle single item submission
  const handleSingleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!singleInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/inbox/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: singleInput, target: "tasks" }),
      });

      if (res.ok) {
        setSingleInput("");
        setSuccessMessage("Captured to workstation!");
        setTimeout(() => setSuccessMessage(null), 2500);
        if (onItemCreated) onItemCreated();
      }
    } catch (err) {
      console.error("Failed to ingest single item:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle batch ingestion
  const handleBatchSubmit = async () => {
    if (!batchInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/inbox/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: batchInput, target: "tasks" }),
      });

      if (res.ok) {
        const json = await res.json();
        setBatchInput("");
        setIsBatchMode(false);
        setSuccessMessage(`Successfully ingested ${json.data.count} items!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        if (onItemCreated) onItemCreated();
      }
    } catch (err) {
      console.error("Failed to ingest batch:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-sm transition-all ${className}`}
    >
      {/* Mode Switcher & Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] font-mono">
            {isBatchMode ? "Batch Brain Dump" : "Quick Ingest"}
          </span>
          {successMessage && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
              <Check className="h-3.5 w-3.5" />
              {successMessage}
            </span>
          )}
          {speechError && (
            <span className="text-xs text-rose-500 font-mono">
              Mic: {speechError}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsBatchMode((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-2 py-1 rounded-[var(--radius-control)] hover:bg-[var(--muted)] cursor-pointer"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>{isBatchMode ? "Switch to Single Ingest" : "Multi-Line Dump"}</span>
        </button>
      </div>

      {/* Single Ingest Mode */}
      {!isBatchMode ? (
        <form onSubmit={handleSingleSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={singleInput}
                onChange={(e) => setSingleInput(e.target.value)}
                placeholder="Type task, e.g. 'Draft launch plan #marketing p:high !tomorrow @45m'..."
                className="w-full h-10 px-3.5 pr-10 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
              />

              {/* Speech-to-Text Microphone Button */}
              {isSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-2.5 p-1.5 rounded-full transition-all cursor-pointer ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Click to speak"}
                  aria-label="Speech to text input"
                >
                  {isListening ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={!singleInput.trim() || isSubmitting}
              size="sm"
              className="h-10 px-4 gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>

          {/* Real-time Syntax Token Preview Chips */}
          {parsedSingle && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[var(--muted-foreground)] text-[11px] font-mono">
                Tokens parsed:
              </span>
              {parsedSingle.projectName && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                  <Folder className="h-3 w-3" />
                  #{parsedSingle.projectName}
                </span>
              )}
              {parsedSingle.priority && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  p:{parsedSingle.priority}
                </span>
              )}
              {parsedSingle.date && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium">
                  <Calendar className="h-3 w-3" />
                  !{parsedSingle.date}
                </span>
              )}
              {parsedSingle.estimatedMinutes && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium">
                  <Clock className="h-3 w-3" />
                  @{parsedSingle.estimatedMinutes}m
                </span>
              )}
              {parsedSingle.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] font-mono text-[10px]"
                >
                  +{tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Syntax Legend for User Guidance */}
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)] font-mono pt-0.5">
            <span>Syntax hints:</span>
            <code className="text-[10px] bg-[var(--muted)] px-1 py-0.5 rounded">#project</code>
            <code className="text-[10px] bg-[var(--muted)] px-1 py-0.5 rounded">!today</code>
            <code className="text-[10px] bg-[var(--muted)] px-1 py-0.5 rounded">p:high</code>
            <code className="text-[10px] bg-[var(--muted)] px-1 py-0.5 rounded">@30m</code>
          </div>
        </form>
      ) : (
        /* Multi-Line Batch Brain Dump Mode */
        <div className="space-y-3">
          <textarea
            rows={5}
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder={`Paste your bullet points or thoughts:\n- [ ] Ship auth migration #infra p:high !today\n- [ ] Update documentation @30m\n- [x] Tested with vitest`}
            className="w-full p-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--background)] text-xs sm:text-sm font-mono text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors resize-y"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              {parsedBatch.length > 0
                ? `Detected ${parsedBatch.length} discrete task items`
                : "Paste multi-line markdown or plain list"}
            </span>

            <Button
              type="button"
              onClick={handleBatchSubmit}
              disabled={parsedBatch.length === 0 || isSubmitting}
              size="sm"
              className="gap-1.5"
            >
              <span>Ingest All ({parsedBatch.length})</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
