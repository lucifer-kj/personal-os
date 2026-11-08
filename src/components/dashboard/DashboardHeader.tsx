"use client";

import * as React from "react";
import { Sparkles, Edit2, Check, X, Play, Calendar as CalendarIcon, Sun, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicScenery, TimeOfDay } from "./DynamicScenery";
import { AppOrb, OrbState } from "@/components/brand/AppOrb";

interface DashboardHeaderProps {
  greeting: string;
  dateStr: string;
  userName?: string;
  initialIntention: string | null;
  onUpdateIntention: (intention: string) => Promise<void>;
  onStartFocus?: () => void;
  onPlanDay?: () => void;
}

export function DashboardHeader({
  greeting,
  dateStr,
  userName = "Arif",
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
  const [showSceneryPicker, setShowSceneryPicker] = React.useState(false);

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
      case "evening":
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
    <div className="relative rounded-3xl border border-[#EDE7DE] dark:border-[#2A2624] overflow-hidden bg-white/60 dark:bg-[#161413]/70 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-colors">
      {/* 1. Time-of-Day Dynamic Scenic Mountain Horizon Background */}
      <DynamicScenery className="h-full" forceTimeOfDay={previewTimeOfDay ?? undefined} />

      {/* 2. Hero Content Region - Compact, Sleek Editorial Proportions */}
      <div className="relative z-10 p-4 sm:p-5 space-y-3 sm:space-y-3.5">
        {/* Date & Weather Pill + Disguised Scenery Control */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono tracking-wider text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] shadow-2xs text-[var(--foreground)]">
            <span className="h-2 w-2 rounded-full bg-[#E05B27] inline-block animate-pulse" />
            <span className="font-semibold">{shortDate}</span>
            <span className="text-[var(--muted-foreground)] opacity-50">•</span>
            <div className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>24°C Kolkata</span>
            </div>
          </div>

          {/* Discreet Scenery Preview Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSceneryPicker(!showSceneryPicker)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md px-2.5 py-1 text-[11px] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="h-3 w-3 text-[#E05B27]" />
              <span className="capitalize">{previewTimeOfDay ?? "Auto"}</span>
            </button>

            {showSceneryPicker && (
              <div className="absolute right-0 top-full mt-1.5 z-20 flex items-center gap-1 p-1 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-lg">
                {(["auto", "dawn", "day", "dusk", "evening", "night"] as const).map((mode) => {
                  const isActive =
                    (mode === "auto" && previewTimeOfDay === null) ||
                    previewTimeOfDay === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setPreviewTimeOfDay(mode === "auto" ? null : mode);
                        setShowSceneryPicker(false);
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] capitalize transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#E05B27] text-white font-semibold shadow-xs"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Big Editorial Heading & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[var(--foreground)] leading-snug">
              {greeting}, {userName}.
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] italic font-serif">
              A focused day builds meaningful progress.
            </p>
          </div>

          {/* Thinking Orb Avatar (Compact 48px) */}
          <div className="shrink-0 flex items-center justify-center">
            <AppOrb size={48} state={orbState} interactive />
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          <Button
            size="sm"
            onClick={onStartFocus}
            className="h-8.5 px-4 rounded-full bg-[#E05B27] hover:bg-[#C94D1D] active:scale-95 text-white text-xs font-semibold gap-1.5 shadow-sm transition-transform cursor-pointer"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Start Deep Work (45m)</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onPlanDay}
            className="h-8.5 px-4 rounded-full bg-white/95 dark:bg-[#1C1917]/95 text-[#24211F] dark:text-[#F3EFEA] border border-[#E5DDD3] dark:border-white/15 hover:bg-stone-100 dark:hover:bg-[#282421] active:scale-95 text-xs font-semibold gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <CalendarIcon className="h-3 w-3 text-[#E05B27]" />
            <span className="text-[#24211F] dark:text-[#F3EFEA] font-semibold">Plan My Day</span>
          </Button>
        </div>

        {/* Daily Focus Intention Compact Bar */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xs px-3.5 py-2 sm:py-2.5 transition-colors shadow-2xs">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E05B27] shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Intention:</span>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What is your singular priority for today?"
                className="flex-1 rounded-lg border border-[#E2DAD1] bg-white dark:bg-[#1E1B19] px-3 py-1.5 text-xs text-[#24211F] dark:text-[#F3EFEA] placeholder:text-[#A0988E] focus:outline-none focus:ring-1 focus:ring-[#B94A24]"
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
                className="h-7 px-2.5 rounded-lg bg-[#B94A24] text-white text-xs"
                aria-label="Save intention"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="h-7 px-2.5 rounded-lg text-xs"
                aria-label="Cancel editing"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Sparkles className="h-3.5 w-3.5 text-[#E05B27] shrink-0" />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#E05B27] shrink-0">
                  Daily Focus Intention
                </span>
                <span className="text-[var(--muted-foreground)] opacity-40 shrink-0">•</span>
                <span className="text-xs text-[#24211F] dark:text-[#EDE7DE] truncate italic font-serif">
                  {intention
                    ? `“${intention}”`
                    : "No focus intention set for today. Take a moment to define your primary outcome."}
                </span>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                title="Edit intention"
              >
                <Edit2 className="h-3 w-3" />
                <span>{intention ? "Edit" : "Set intention"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
