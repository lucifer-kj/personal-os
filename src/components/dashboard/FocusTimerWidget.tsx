"use client";

import * as React from "react";
import { Clock, Play, Pause, Square, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FocusTimerWidgetProps {
  initialSeconds?: number;
  label?: string;
  onSessionComplete?: () => void;
  className?: string;
}

export function FocusTimerWidget({
  initialSeconds = 45 * 60, // 45 minutes default
  label = "Deep Work",
  onSessionComplete,
  className,
}: FocusTimerWidgetProps) {
  const [totalSeconds, setTotalSeconds] = React.useState(initialSeconds);
  const [secondsRemaining, setSecondsRemaining] = React.useState(initialSeconds);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            if (onSessionComplete) onSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, onSessionComplete]);

  const togglePlay = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(totalSeconds);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  // Circumference for r=54
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <Card className={cn("p-5 sm:p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#2A2624] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl flex flex-col justify-between transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7269] dark:text-[#A69E94]">
          <Clock className="h-4 w-4 text-[#B94A24] dark:text-[#E07A50]" />
          <span>Focus Timer</span>
        </div>
        <button
          type="button"
          className="text-[#968E85] hover:text-[#24211F] dark:hover:text-[#EDE7DE] p-1 rounded-md transition-colors"
          aria-label="Timer settings"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Radial Timer Ring + Controls */}
      <div className="my-auto py-2 flex items-center justify-around gap-4">
        {/* SVG Radial Gauge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-[#F2EAE1] dark:text-[#272320]"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="url(#timer-gradient)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E06A3A" />
                <stop offset="100%" stopColor="#B94A24" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time & Label Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold tracking-tight text-[#24211F] dark:text-[#F3EFEA] font-mono">
              {formattedTime}
            </span>
            <span className="text-[11px] font-medium text-[#7A7269] dark:text-[#A69E94] mt-0.5">
              {label}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={togglePlay}
            className="h-12 w-12 rounded-full bg-[#B94A24] hover:bg-[#A33E1C] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
            aria-label={isActive ? "Pause timer" : "Start timer"}
          >
            {isActive ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSecondsRemaining((prev) => prev + 300);
              setTotalSeconds((prev) => prev + 300);
            }}
            className="h-9 w-9 rounded-full bg-[#F7F4EF] hover:bg-[#EFE9DF] active:scale-95 border border-[#E8E1D7] dark:bg-[#201C1A] dark:border-[#332E2A] dark:hover:bg-[#2C2724] text-[#554E46] dark:text-[#C4BCB3] flex items-center justify-center transition-all cursor-pointer text-[11px] font-mono font-medium"
            aria-label="Add 5 minutes"
            title="Add 5 minutes"
          >
            +5m
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="h-9 w-9 rounded-full bg-[#F7F4EF] hover:bg-[#EFE9DF] active:scale-95 border border-[#E8E1D7] dark:bg-[#201C1A] dark:border-[#332E2A] dark:hover:bg-[#2C2724] text-[#554E46] dark:text-[#C4BCB3] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Reset timer"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Footer Status Bar matching CurrentFocusCard */}
      <div className="mt-auto pt-3 border-t border-[#F4EFEA] dark:border-[#221F1D] flex items-center justify-between text-xs text-[#7A7269] dark:text-[#A69E94]">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className={`inline-block h-2 w-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-[#B94A24]"}`} />
          <span>{isActive ? "Deep work active" : "Timer ready"}</span>
        </div>
        <span className="font-mono text-xs font-medium text-[#24211F] dark:text-[#F3EFEA]">
          {Math.round(totalSeconds / 60)}m target
        </span>
      </div>
    </Card>
  );
}
