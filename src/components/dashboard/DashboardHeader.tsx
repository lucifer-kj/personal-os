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

      {/* 2. Hero Content Region */}
      <div className="relative z-10 p-6 sm:p-9 space-y-5">
        {/* Date & Weather Pill + Disguised Scenery Control */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono tracking-wider text-[#7A7269] dark:text-[#A69E94]">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-[#E8DFD5] dark:border-white/10 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[#E05B27] inline-block animate-pulse" />
            <span className="font-semibold text-[#24211F] dark:text-[#F3EFEA]">{shortDate}</span>
            <span className="text-[#C5BCB2] dark:text-neutral-600">•</span>
            <div className="flex items-center gap-1.5 text-[#24211F] dark:text-[#F3EFEA]">
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>24°C Kolkata</span>
            </div>
          </div>

          {/* Discreet Scenery Preview Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSceneryPicker(!showSceneryPicker)}
              className="flex items-center gap-1.5 rounded-full border border-[#E8DFD5] dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-md px-2.5 py-1 text-[11px] hover:bg-white dark:hover:bg-black/50 transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="h-3 w-3 text-[#A84A28]" />
              <span className="capitalize">{previewTimeOfDay ?? "Auto"}</span>
            </button>

            {showSceneryPicker && (
              <div className="absolute right-0 top-full mt-1.5 z-20 flex items-center gap-1 p-1 rounded-full bg-white dark:bg-[#1E1B19] border border-[#EDE7DE] dark:border-[#332E2A] shadow-lg">
                {(["auto", "dawn", "day", "dusk", "night"] as const).map((mode) => {
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
                      className={`px-2 py-0.5 rounded-full text-[10px] capitalize transition-all ${
                        isActive
                          ? "bg-[#B94A24] text-white font-semibold shadow-xs"
                          : "text-[#7A7269] hover:text-[#24211F] dark:text-[#A69E94]"
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#24211F] dark:text-[#F3EFEA] leading-tight">
              {greeting}, {userName}.
            </h1>
            <p className="text-sm sm:text-base text-[#7A7269] dark:text-[#A69E94] italic font-serif">
              A focused day builds meaningful progress.
            </p>
          </div>

          {/* Thinking Orb Avatar */}
          <div className="shrink-0 flex items-center justify-center">
            <AppOrb size={68} state={orbState} interactive />
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            size="default"
            onClick={onStartFocus}
            className="h-10 px-5 rounded-full bg-[#B94A24] hover:bg-[#A33E1C] active:scale-95 text-white text-xs font-medium gap-2 shadow-sm transition-transform"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Start Deep Work (45m)</span>
          </Button>

          <Button
            size="default"
            variant="outline"
            onClick={onPlanDay}
            className="h-10 px-5 rounded-full bg-white/80 hover:bg-white active:scale-95 text-[#24211F] dark:text-[#EDE7DE] border-[#E2DAD1] dark:border-white/10 text-xs font-medium gap-2 shadow-xs transition-transform"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-[#B94A24]" />
            <span>Plan My Day</span>
          </Button>
        </div>

        {/* Daily Focus Intention Pill Card */}
        <div className="rounded-2xl border border-[#EDE7DE] dark:border-[#2A2624] bg-white/80 dark:bg-black/30 backdrop-blur-xs p-4 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B94A24] dark:text-[#E07A50]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Daily Focus Intention</span>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-[#7A7269] hover:text-[#24211F] dark:text-[#A69E94] dark:hover:text-[#EDE7DE] flex items-center gap-1 transition-colors"
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
                className="flex-1 rounded-lg border border-[#E2DAD1] bg-white dark:bg-[#1E1B19] px-3.5 py-2 text-xs sm:text-sm text-[#24211F] dark:text-[#F3EFEA] placeholder:text-[#A0988E] focus:outline-none focus:ring-1 focus:ring-[#B94A24]"
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
                className="h-8 px-3 rounded-lg bg-[#B94A24] text-white"
                aria-label="Save intention"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="h-8 px-3 rounded-lg"
                aria-label="Cancel editing"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <p className="mt-1.5 text-xs sm:text-sm text-[#24211F] dark:text-[#EDE7DE] italic">
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
