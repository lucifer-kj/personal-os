"use client";

import * as React from "react";
import { Sparkles, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  greeting: string;
  dateStr: string;
  initialIntention: string | null;
  onUpdateIntention: (intention: string) => Promise<void>;
}

export function DashboardHeader({
  greeting,
  dateStr,
  initialIntention,
  onUpdateIntention,
}: DashboardHeaderProps) {
  const [intention, setIntention] = React.useState(initialIntention || "");
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(initialIntention || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Format date: e.g. "Friday, November 6, 2026"
  const formattedDate = React.useMemo(() => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }, [dateStr]);

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onUpdateIntention(inputValue.trim());
      setIntention(inputValue.trim());
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update intention:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setInputValue(intention);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
            Today
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] mt-0.5">
            {greeting}
          </h1>
        </div>
        <div className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)]">
          {formattedDate}
        </div>
      </div>

      {/* Daily Intention Banner */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Daily Focus Intention</span>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
              title="Edit intention"
            >
              <Edit2 className="h-3 w-3" />
              <span>{intention ? "Edit" : "Set intention"}</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What is your singular priority for today?"
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            <Button
              size="sm"
              variant="default"
              onClick={handleSave}
              disabled={isSubmitting}
              className="h-8 px-2.5"
              aria-label="Save intention"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-8 px-2.5"
              aria-label="Cancel editing"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--foreground)] italic">
            {intention ? `“${intention}”` : "No focus intention set for today. Take a moment to define your primary outcome."}
          </p>
        )}
      </div>
    </div>
  );
}
