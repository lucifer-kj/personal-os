"use client";

import * as React from "react";
import { Sparkles, Edit2, Check, X, Play, Calendar as CalendarIcon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicScenery, TimeOfDay } from "./DynamicScenery";
import { AppOrb, OrbState } from "@/components/brand/AppOrb";

interface DashboardHeaderProps {
  greeting: string;
  dateStr: string;
  initialIntention: string | null;
  onUpdateIntention: (intention: string) => Promise<void>;
  onStartFocus?: () => void;
  onPlanDay?: () => void;
}

export function DashboardHeader({
  greeting,
  dateStr,
  initialIntention,
  onUpdateIntention,
  onStartFocus,
  onPlanDay,
}: DashboardHeaderProps) {
  const [intention, setIntention] = React.useState(initialIntention || "");
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(initialIntention || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [previewTimeOfDay, setPreviewTimeOfDay] = React.useState<TimeOfDay | null>(null);

  // Compute synchronized orb state based on scenery time of day
  const orbState: OrbState = React.useMemo(() => {
    if (!previewTimeOfDay) return "breathing";
    switch (previewTimeOfDay) {
      case "dawn":
        return "breathing";
      case "day":
        return "working";
      case "dusk":
        return "weaving";
      case "night":
        return "solving";
    }
  }, [previewTimeOfDay]);

  // Format short date: e.g. "THU, NOV 6"
  const shortDate = React.useMemo(() => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).toUpperCase();
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
    <div className="relative rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--card)] shadow-xs transition-colors">
      {/* 1. Time-of-Day Dynamic Scenic Mountain Horizon Background */}
      <DynamicScenery className="h-full" forceTimeOfDay={previewTimeOfDay ?? undefined} />

      {/* 2. Hero Content Region */}
      <div className="relative z-10 p-5 sm:p-7 space-y-4">
        {/* Date & Weather / Time-Scrubber Control Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono tracking-wider text-[var(--muted-foreground)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
              <span>{shortDate}</span>
            </div>
            <span className="text-[var(--border)]">•</span>
            <div className="flex items-center gap-1 text-[var(--foreground)]">
              <Sun className="h-3 w-3 text-amber-500" />
              <span>Focused Horizon</span>
            </div>
          </div>

          {/* Day Change & Scenery Preview Pill */}
          <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md px-2 py-0.5 shadow-2xs">
            <span className="text-[10px] text-[var(--muted-foreground)] mr-0.5">Scenery:</span>
            {(["auto", "dawn", "day", "dusk", "night"] as const).map((mode) => {
              const isActive =
                (mode === "auto" && previewTimeOfDay === null) ||
                previewTimeOfDay === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewTimeOfDay(mode === "auto" ? null : mode)}
                  className={`px-1.5 py-0.5 rounded-full text-[10px] capitalize transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Editorial Heading & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[var(--foreground)]">
              {greeting}, User.
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] italic font-serif mt-1">
              A focused day builds meaningful progress.
            </p>
          </div>

          {/* Glowing Animated Orb Avatar from Jakubantalik/thinking-orbs */}
          <div className="shrink-0">
            <AppOrb size={64} state={orbState} interactive />
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            size="sm"
            variant="default"
            onClick={onStartFocus}
            className="h-9 px-4 gap-2 text-xs font-medium shadow-xs"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Start Deep Work (45m)</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onPlanDay}
            className="h-9 px-3.5 gap-2 text-xs font-medium bg-[var(--card)]/80 backdrop-blur-xs"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Plan My Day</span>
          </Button>
        </div>

        {/* Daily Focus Intention Pill Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xs p-3.5 transition-colors mt-2">
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
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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
              {intention
                ? `“${intention}”`
                : "No focus intention set for today. Take a moment to define your primary outcome."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
