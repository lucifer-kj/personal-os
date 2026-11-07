"use client";

import * as React from "react";
import { JournalEntry, JournalMood } from "@/modules/journal/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Smile,
  Meh,
  Frown,
  Zap,
  Heart,
  Sparkles,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalEditorProps {
  entry: JournalEntry | null;
  selectedDate: string;
  onSave: (data: {
    entry_date: string;
    title?: string;
    content?: string;
    mood?: JournalMood | null;
    energy_level?: number | null;
    reflection?: string;
    gratitude?: string[];
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const moodOptions: { value: JournalMood; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "great", label: "Great", icon: Smile },
  { value: "good", label: "Good", icon: Smile },
  { value: "neutral", label: "Neutral", icon: Meh },
  { value: "low", label: "Low", icon: Frown },
  { value: "rough", label: "Rough", icon: Frown },
];

export function JournalEditor({
  entry,
  selectedDate,
  onSave,
}: JournalEditorProps) {
  const [title, setTitle] = React.useState(entry?.title || "");
  const [content, setContent] = React.useState(entry?.content || "");
  const [mood, setMood] = React.useState<JournalMood | null>(entry?.mood || null);
  const [energyLevel, setEnergyLevel] = React.useState<number | null>(entry?.energy_level || null);
  const [reflection, setReflection] = React.useState(entry?.reflection || "");
  const [gratitude1, setGratitude1] = React.useState(entry?.gratitude?.[0] || "");
  const [gratitude2, setGratitude2] = React.useState(entry?.gratitude?.[1] || "");
  const [gratitude3, setGratitude3] = React.useState(entry?.gratitude?.[2] || "");

  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "unsaved">("saved");

  const handleManualSave = async () => {
    try {
      setSaveStatus("saving");
      const gratitudeList = [gratitude1, gratitude2, gratitude3]
        .map((s) => s.trim())
        .filter(Boolean);

      await onSave({
        entry_date: selectedDate,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        mood,
        energy_level: energyLevel,
        reflection: reflection.trim() || undefined,
        gratitude: gratitudeList,
      });

      setSaveStatus("saved");
    } catch (err) {
      console.error("Save journal error:", err);
      setSaveStatus("unsaved");
    }
  };

  const markDirty = () => {
    if (saveStatus !== "unsaved") {
      setSaveStatus("unsaved");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
      {/* Top Bar: Title & Autosave status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <input
          type="text"
          placeholder="Daily Entry Title (Optional)..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
          className="text-xl sm:text-2xl font-serif font-medium bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none w-full"
        />

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-[var(--primary)]" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === "unsaved" && <span>Unsaved changes</span>}
          </div>

          <Button
            size="sm"
            onClick={handleManualSave}
            disabled={saveStatus === "saving"}
            className="gap-1.5 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Entry</span>
          </Button>
        </div>
      </div>

      {/* Mood & Energy selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mood */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Smile className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Daily Mood</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {moodOptions.map((opt) => {
              const isSelected = mood === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setMood(isSelected ? null : opt.value);
                    markDirty();
                  }}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-xs"
                      : "bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40"
                  )}
                >
                  <opt.icon className="h-3.5 w-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level (1-5) */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Energy Level</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => {
              const isSelected = energyLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setEnergyLevel(isSelected ? null : level);
                    markDirty();
                  }}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-medium border flex items-center justify-center transition-colors cursor-pointer",
                    isSelected
                      ? "bg-amber-600 border-amber-600 text-white shadow-xs"
                      : "bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-amber-500/50"
                  )}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Journal Content Writing Surface */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Reflective Writing Surface
        </label>
        <textarea
          rows={10}
          placeholder="Pour your stream of consciousness, thoughts, creative ideas, or day summary here..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            markDirty();
          }}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm sm:text-base leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-y font-serif"
        />
      </div>

      {/* Gratitude & Intentions Split Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[var(--border)]">
        {/* Gratitude */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <span>Three Grateful Observations</span>
          </label>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="1. A peaceful morning cup of coffee..."
              value={gratitude1}
              onChange={(e) => {
                setGratitude1(e.target.value);
                markDirty();
              }}
              className="text-xs font-serif"
            />
            <Input
              type="text"
              placeholder="2. Meaningful progress on personal projects..."
              value={gratitude2}
              onChange={(e) => {
                setGratitude2(e.target.value);
                markDirty();
              }}
              className="text-xs font-serif"
            />
            <Input
              type="text"
              placeholder="3. Clarity of thought and good health..."
              value={gratitude3}
              onChange={(e) => {
                setGratitude3(e.target.value);
                markDirty();
              }}
              className="text-xs font-serif"
            />
          </div>
        </div>

        {/* Reflection */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Evening Reflection or Realization</span>
          </label>
          <textarea
            rows={4}
            placeholder="What worked well today? What can be released or improved tomorrow?"
            value={reflection}
            onChange={(e) => {
              setReflection(e.target.value);
              markDirty();
            }}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none font-serif"
          />
        </div>
      </div>
    </div>
  );
}
