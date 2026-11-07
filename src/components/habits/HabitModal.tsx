"use client";

import * as React from "react";
import { HabitFrequency } from "@/modules/habits/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    frequency?: HabitFrequency;
    target_days?: number[];
    color?: string;
  }) => Promise<void>;
}

const colorOptions = [
  { label: "Terracotta", value: "terracotta", bg: "bg-[#b84318]" },
  { label: "Amber", value: "amber", bg: "bg-amber-600" },
  { label: "Sage", value: "sage", bg: "bg-emerald-600" },
  { label: "Ocean", value: "ocean", bg: "bg-sky-600" },
  { label: "Stone", value: "stone", bg: "bg-stone-600" },
];

export function HabitModal({ isOpen, onClose, onSubmit }: HabitModalProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [frequency, setFrequency] = React.useState<HabitFrequency>("daily");
  const [targetDays, setTargetDays] = React.useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [selectedColor, setSelectedColor] = React.useState("terracotta");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Habit name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        frequency,
        target_days: frequency === "daily" ? [1, 2, 3, 4, 5, 6, 7] : targetDays,
        color: selectedColor,
      });
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const dayLabels = [
    { label: "M", val: 1 },
    { label: "T", val: 2 },
    { label: "W", val: 3 },
    { label: "T", val: 4 },
    { label: "F", val: 5 },
    { label: "S", val: 6 },
    { label: "S", val: 7 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-serif font-medium text-[var(--foreground)]">New Habit</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1 block">
              Habit Name
            </label>
            <Input
              type="text"
              placeholder="e.g. 20-Minute Evening Reading"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1 block">
              Description (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Non-fiction, quiet room, phone in drawer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5 block">
              Frequency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["daily", "weekdays", "weekends", "custom"] as HabitFrequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={cn(
                    "text-xs font-medium py-1.5 rounded-lg border capitalize transition-colors",
                    frequency === freq
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40"
                  )}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {frequency === "custom" && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5 block">
                Target Days
              </label>
              <div className="flex gap-1.5">
                {dayLabels.map(({ label, val }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleDay(val)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-medium border flex items-center justify-center transition-colors",
                      targetDays.includes(val)
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)]"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5 block">
              Color Token
            </label>
            <div className="flex gap-2.5">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedColor(opt.value)}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-transform",
                    opt.bg,
                    selectedColor === opt.value
                      ? "scale-110 border-[var(--foreground)]"
                      : "border-transparent opacity-80 hover:opacity-100"
                  )}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Habit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
