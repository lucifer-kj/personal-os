"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  X,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Bookmark,
  Calendar,
  Send,
  Loader2,
} from "lucide-react";
import { CaptureType } from "@/modules/inbox/types";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptured?: () => void;
}

export function QuickCaptureModal({
  isOpen,
  onClose,
  onCaptured,
}: QuickCaptureModalProps) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [captureType, setCaptureType] = React.useState<CaptureType>("idea");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync state when open status toggles
  const [prevOpen, setPrevOpen] = React.useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setIsSuccess(false);
    } else {
      setTitle("");
      setContent("");
      setUrl("");
      setCaptureType("idea");
    }
  }

  // Focus input automatically when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Escape to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          url: url.trim() || null,
          capture_type: captureType,
          source: "manual",
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        onCaptured?.();
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error("Failed to capture inbox item:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const types: Array<{ type: CaptureType; label: string; icon: React.ReactNode }> = [
    { type: "idea", label: "Idea", icon: <Sparkles className="h-3 w-3" /> },
    { type: "task", label: "Task", icon: <CheckCircle2 className="h-3 w-3" /> },
    { type: "note", label: "Note", icon: <Bookmark className="h-3 w-3" /> },
    { type: "link", label: "Link", icon: <LinkIcon className="h-3 w-3" /> },
    { type: "reminder", label: "Reminder", icon: <Calendar className="h-3 w-3" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <Card className="relative w-full max-w-lg bg-[var(--card)] border-[var(--border)] shadow-xl overflow-hidden p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            <h2 className="text-sm font-semibold tracking-wide text-[var(--foreground)] uppercase font-mono">
              Quick Capture
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
            aria-label="Close capture"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <p className="text-sm font-medium text-[var(--foreground)]">Captured to Inbox</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Primary One-Line Capture Input */}
            <div className="space-y-1.5">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind? Capture immediately..."
                className="w-full text-base font-medium px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                required
              />
            </div>

            {/* Optional Additional Detail */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add optional notes, context, or thoughts..."
              rows={2}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />

            {/* URL Input (if link or reference) */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
              <LinkIcon className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://... (optional URL reference)"
                className="w-full text-xs bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
              />
            </div>

            {/* Type selector chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {types.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setCaptureType(t.type)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    captureType === t.type
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                Press Enter to capture
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" type="button" onClick={onClose} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className="gap-1.5 shadow-xs text-xs h-9 px-4"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Capture Item</span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
