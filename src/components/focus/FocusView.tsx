"use client";

import * as React from "react";
import { AppOrb, OrbState } from "@/components/brand/AppOrb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
} from "lucide-react";
import { ActiveFocusSession } from "@/modules/focus/types";
import { startAmbientNoise, stopAmbientNoise } from "@/lib/audio/ambientAudio";

interface FocusViewProps {
  initialActiveSession?: ActiveFocusSession | null;
  autoFetch?: boolean;
  onExit?: () => void;
  onSessionComplete?: () => void;
}

export function FocusView({
  initialActiveSession = null,
  autoFetch = false,
  onExit,
  onSessionComplete,
}: FocusViewProps) {
  const [activeSession, setActiveSession] = React.useState<ActiveFocusSession | null>(
    initialActiveSession
  );
  const [isLoading, setIsLoading] = React.useState(autoFetch && initialActiveSession === undefined);
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = React.useState<number>(
    initialActiveSession?.remaining_seconds ?? 25 * 60
  );
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [isFinishing, setIsFinishing] = React.useState(false);
  const [rating, setRating] = React.useState<number>(5);
  const [reflectionNotes, setReflectionNotes] = React.useState("");
  const [markCompleteTask, setMarkCompleteTask] = React.useState(false);

  // Play soothing acoustic brown noise when unmuted during active focus session
  React.useEffect(() => {
    if (soundEnabled && activeSession?.session.status === "running") {
      const stop = startAmbientNoise();
      return () => stop();
    } else {
      stopAmbientNoise();
    }
    return () => {
      stopAmbientNoise();
    };
  }, [soundEnabled, activeSession?.session.status]);

  // Sync state if initialActiveSession changes via props
  const [prevInitial, setPrevInitial] = React.useState(initialActiveSession);
  if (initialActiveSession !== prevInitial) {
    setPrevInitial(initialActiveSession);
    setActiveSession(initialActiveSession);
    setSessionSecondsRemaining(initialActiveSession?.remaining_seconds ?? 25 * 60);
  }

  // Fetch active session if autoFetch enabled
  React.useEffect(() => {
    if (!autoFetch) return;

    let isSubscribed = true;

    async function fetchActive() {
      try {
        const res = await fetch("/api/v1/focus");
        if (res.ok && isSubscribed) {
          const json = await res.json();
          if (json.data?.active) {
            setActiveSession(json.data.active);
            setSessionSecondsRemaining(json.data.active.remaining_seconds ?? 25 * 60);
          }
        }
      } catch (err) {
        console.error("Failed to load active focus session:", err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    fetchActive();
    return () => {
      isSubscribed = false;
    };
  }, [autoFetch]);

  // Client-side smooth countdown when running
  React.useEffect(() => {
    if (!activeSession || activeSession.session.status !== "running") return;

    const timer = setInterval(() => {
      setSessionSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start new default 25m session if none exists
  const handleStartNewSession = async (mode = "deep_work", durationSeconds = 1500) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_mode: mode,
          planned_duration_seconds: durationSeconds,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setActiveSession(json.data);
        setSessionSecondsRemaining(json.data.remaining_seconds ?? durationSeconds);
      }
    } catch (err) {
      console.error("Failed to start session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/v1/focus/${activeSession.session.id}/pause`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setActiveSession(json.data);
      }
    } catch (err) {
      console.error("Failed to pause:", err);
    }
  };

  const handleResume = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/v1/focus/${activeSession.session.id}/resume`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setActiveSession(json.data);
      }
    } catch (err) {
      console.error("Failed to resume:", err);
    }
  };

  const handleComplete = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/v1/focus/${activeSession.session.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_rating: rating,
          notes: reflectionNotes,
          mark_task_completed: markCompleteTask,
        }),
      });
      if (res.ok) {
        setActiveSession(null);
        setIsFinishing(false);
        onSessionComplete?.();
      }
    } catch (err) {
      console.error("Failed to complete:", err);
    }
  };

  const handleAbandon = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/v1/focus/${activeSession.session.id}/abandon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "User cancelled" }),
      });
      if (res.ok) {
        setActiveSession(null);
        setIsFinishing(false);
      }
    } catch (err) {
      console.error("Failed to abandon:", err);
    }
  };

  // Determine AppOrb state depending on session
  const orbState: OrbState = React.useMemo(() => {
    if (isFinishing) return "composing";
    if (!activeSession) return "breathing";
    if (activeSession.session.status === "paused") return "breathing";
    if (activeSession.session.session_mode === "short_break" || activeSession.session.session_mode === "long_break") {
      return "weaving";
    }
    return "working";
  }, [activeSession, isFinishing]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[600px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AppOrb size={64} state="searching" />
          <p className="text-xs font-mono text-[var(--muted-foreground)]">Preparing focus space...</p>
        </div>
      </div>
    );
  }

  // Completion reflection modal / card
  if (isFinishing && activeSession) {
    return (
      <div className="mx-auto max-w-md py-12 px-4 space-y-6 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <AppOrb size={64} state={orbState} />
          </div>
          <h2 className="text-2xl font-serif font-medium text-[var(--foreground)]">Complete Focus Session</h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Take a moment to record your reflection and rate your clarity.
          </p>
        </div>

        <Card className="p-6 space-y-5 bg-[var(--card)] border-[var(--border)]">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--foreground)]">Session Clarity & Focus</label>
            <div className="flex items-center justify-between gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    rating >= star
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-[var(--muted)]/40 border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {star} ★
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--foreground)]">Reflection Notes (Optional)</label>
            <textarea
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              placeholder="What did you accomplish? Any breakthroughs or distractions?"
              className="w-full h-24 p-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {activeSession.timeEntry.task_id && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={markCompleteTask}
                onChange={(e) => setMarkCompleteTask(e.target.checked)}
                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span>Mark associated task as completed</span>
            </label>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFinishing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleComplete} className="gap-1.5 shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Save & Complete</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // No active session: Start screen
  if (!activeSession) {
    return (
      <div className="mx-auto max-w-lg py-12 px-4 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-6">
            <AppOrb size={64} state="breathing" interactive />
          </div>
          <h1 className="text-3xl font-serif font-medium text-[var(--foreground)]">Begin Focus Session</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-serif italic max-w-sm mx-auto">
            Choose a deep work rhythm or custom sprint to enter flow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => handleStartNewSession("deep_work", 45 * 60)}
            className="flex flex-col text-left p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">Deep Work</span>
              <Badge variant="outline" className="font-mono text-[10px]">45 min</Badge>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Uninterrupted single-task concentration for high-cognitive output.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleStartNewSession("pomodoro", 25 * 60)}
            className="flex flex-col text-left p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">Pomodoro</span>
              <Badge variant="outline" className="font-mono text-[10px]">25 min</Badge>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Classic interval sprint followed by a restorative breathing break.
            </p>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStartNewSession("short_break", 5 * 60)}
            className="text-xs gap-1.5"
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Short Break (5m)</span>
          </Button>
          {onExit && (
            <Button variant="ghost" size="sm" onClick={onExit} className="text-xs">
              Return to Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Active Running / Paused Session Screen
  const isPaused = activeSession.session.status === "paused";

  return (
    <div className="relative mx-auto max-w-2xl py-10 px-4 space-y-10 flex flex-col items-center justify-center min-h-[550px] animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="w-full flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <Badge variant="outline" className="uppercase font-mono text-[11px] tracking-wider px-3 py-1">
          {activeSession.session.session_mode.replace("_", " ")}
        </Badge>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8 p-0"
            title={soundEnabled ? "Mute ambient audio" : "Enable ambient audio"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-[var(--primary)]" />
            ) : (
              <VolumeX className="h-4 w-4 text-[var(--muted-foreground)]" />
            )}
          </Button>

          {onExit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="h-8 w-8 p-0"
              title="Close focus view"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Center Interactive Thinking Orb */}
      <div className="flex flex-col items-center justify-center gap-5">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[var(--primary)]/10 blur-xl animate-pulse" />
          <AppOrb size={64} state={orbState} interactive />
        </div>

        {/* Big Editorial Timer Display */}
        <div className="text-center space-y-1">
          <div className="text-6xl sm:text-7xl font-mono font-light tracking-tight text-[var(--foreground)]">
            {formatTime(sessionSecondsRemaining)}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest font-mono">
            {isPaused ? "Session Paused" : "Focus in Progress"}
          </p>
        </div>

        {/* Active Task / Goal reference pill */}
        {activeSession.timeEntry.description && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--muted)]/50 border border-[var(--border)] text-xs text-[var(--foreground)]">
            <Sparkles className="h-3 w-3 text-[var(--primary)]" />
            <span className="font-medium">{activeSession.timeEntry.description}</span>
          </div>
        )}
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center gap-3">
        {isPaused ? (
          <Button
            size="lg"
            onClick={handleResume}
            className="h-12 px-6 gap-2 text-sm font-medium shadow-xs"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Resume Focus</span>
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            onClick={handlePause}
            className="h-12 px-6 gap-2 text-sm font-medium bg-[var(--card)]"
          >
            <Pause className="h-4 w-4" />
            <span>Pause Timer</span>
          </Button>
        )}

        <Button
          size="lg"
          onClick={() => setIsFinishing(true)}
          className="h-12 px-6 gap-2 text-sm font-medium bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Finish Session</span>
        </Button>

        <Button
          size="lg"
          variant="ghost"
          onClick={handleAbandon}
          className="h-12 px-4 text-xs text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          title="Discard session"
        >
          <Square className="h-3.5 w-3.5" />
          <span className="sr-only">Abandon</span>
        </Button>
      </div>
    </div>
  );
}
