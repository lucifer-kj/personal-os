"use client";

import * as React from "react";
import { Layers, MoreVertical, Check, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface CurrentFocusCardProps {
  title?: string;
  description?: string;
  subtasks?: SubtaskItem[];
  progressPercent?: number;
  onToggleSubtask?: (id: string) => void;
  onOpenDetails?: () => void;
  className?: string;
}

export function CurrentFocusCard({
  title = "Complete dashboard design & token architecture",
  description = "Finalize layouts, interaction patterns, and design tokens before spec handoff.",
  subtasks: initialSubtasks = [
    { id: "1", title: "Token grid", completed: true },
    { id: "2", title: "Layout system", completed: true },
    { id: "3", title: "Interaction states", completed: false },
  ],
  progressPercent: initialProgress = 75,
  onToggleSubtask,
  onOpenDetails,
  className,
}: CurrentFocusCardProps) {
  const [subtasks, setSubtasks] = React.useState<SubtaskItem[]>(initialSubtasks);

  const handleToggle = (id: string) => {
    setSubtasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
    if (onToggleSubtask) onToggleSubtask(id);
  };

  const completedCount = subtasks.filter((t) => t.completed).length;
  const progressPercent =
    subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : initialProgress;

  return (
    <Card className={cn("p-5 sm:p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#2A2624] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl flex flex-col justify-between transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]", className)}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F7EBE1] text-[#A84A28] dark:bg-[#341F16] dark:text-[#E87A54]">
          Current Focus
        </span>
        <button
          type="button"
          onClick={onOpenDetails}
          className="text-[#968E85] hover:text-[#24211F] dark:hover:text-[#EDE7DE] p-1 rounded-md transition-colors"
          aria-label="Focus options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Main Focus Outcome */}
      <div className="mt-4 flex items-start gap-4">
        <div className="shrink-0 h-11 w-11 rounded-xl bg-[#FFF4ED] dark:bg-[#2C1C15] flex items-center justify-center text-[#B94A24] dark:text-[#E07A50] shadow-2xs border border-[#F6E3D5] dark:border-[#42291E]">
          <Layers className="h-5 w-5" />
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#24211F] dark:text-[#F3EFEA] leading-snug">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7269] dark:text-[#A69E94] leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Subtask Check Chips */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {subtasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => handleToggle(task.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer ${
              task.completed
                ? "bg-[#EAF5EE] text-[#227142] border border-[#D1EADB] dark:bg-[#122A1C] dark:text-[#52C480] dark:border-[#1E432E]"
                : "bg-[#F7F4EF] text-[#69625A] border border-[#E9E2D8] hover:border-[#D8CFBF] dark:bg-[#1F1C1A] dark:text-[#A69E94] dark:border-[#332E2A]"
            }`}
          >
            {task.completed ? (
              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            ) : (
              <Circle className="h-2.5 w-2.5 text-[#A0988E]" />
            )}
            <span>{task.title}</span>
          </button>
        ))}
      </div>

      {/* Progress Bar & Completion Label */}
      <div className="mt-6 pt-3 border-t border-[#F4EFEA] dark:border-[#221F1D] flex items-center justify-between gap-4">
        <div className="flex-1 h-2 rounded-full bg-[#F0EAE1] dark:bg-[#272320] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#B94A24] dark:bg-[#D45E30] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-mono font-medium text-[#7A7269] dark:text-[#A69E94] shrink-0">
          {progressPercent}% complete
        </span>
      </div>
    </Card>
  );
}
