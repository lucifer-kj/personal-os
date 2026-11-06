"use client";

import * as React from "react";
import { Zap, Plus, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickCaptureCardProps {
  onQuickAddTodayTask: (title: string) => Promise<void>;
  onOpenCreateDialog: () => void;
}

export function QuickCaptureCard({
  onQuickAddTodayTask,
  onOpenCreateDialog,
}: QuickCaptureCardProps) {
  const [quickTitle, setQuickTitle] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onQuickAddTodayTask(quickTitle.trim());
      setQuickTitle("");
    } catch (err) {
      console.error("Failed to quick add task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          <Zap className="h-3.5 w-3.5 text-[var(--primary)]" />
          <span>Quick Capture</span>
        </div>

        <button
          onClick={onOpenCreateDialog}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
        >
          <span>Full form</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Capture an actionable thought for today..."
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          size="sm"
          variant="default"
          disabled={!quickTitle.trim() || isSubmitting}
          className="h-8 px-2.5 text-xs shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Capture
        </Button>
      </form>
    </Card>
  );
}
