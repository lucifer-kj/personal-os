"use client";

import * as React from "react";
import Image from "next/image";
import {
  Mic,
  MicOff,
  Send,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Clock,
  Target,
  Sun,
} from "lucide-react";
import { AppOrb } from "@/components/brand/AppOrb";
import { useSpeechToText } from "@/lib/hooks/useSpeechToText";
import { DashboardOverviewDTO } from "@/modules/dashboard/types";
import { toast } from "sonner";

interface MobileFocusedDashboardProps {
  overview: DashboardOverviewDTO;
  onAddTask: () => void;
  onPlanDay: () => void;
  onQuickCapture: () => void;
  onSubmitPrompt?: (text: string) => void;
}

export function MobileFocusedDashboard({
  overview,
  onAddTask,
  onPlanDay,
  onQuickCapture,
  onSubmitPrompt,
}: MobileFocusedDashboardProps) {
  const [inputText, setInputText] = React.useState("");

  const { isListening, transcript, isSupported, startListening, stopListening, clearTranscript } =
    useSpeechToText({
      onTranscriptChange: (text) => setInputText(text),
    });

  const handleToggleVoice = () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in this browser");
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
      toast.info("Listening...", { duration: 2000 });
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (isListening) stopListening();
    if (onSubmitPrompt) {
      onSubmitPrompt(inputText.trim());
    } else {
      toast.success(`Captured: "${inputText.trim()}"`);
    }
    setInputText("");
    clearTranscript();
  };

  const totalTasks = overview.metrics.tasks_completed_today + overview.metrics.tasks_pending_today;
  const targetPercent =
    totalTasks > 0 ? Math.round((overview.metrics.tasks_completed_today / totalTasks) * 100) : 68;

  // Format short date: e.g. "THU, NOV 6"
  const shortDate = React.useMemo(() => {
    try {
      const [year, month, day] = overview.date.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).toUpperCase();
    } catch {
      return "THU, NOV 6";
    }
  }, [overview.date]);

  return (
    <div className="lg:hidden min-h-[calc(100vh-var(--header-height))] bg-[#0D0B0A] text-white -mx-4 -mt-4 px-4 pt-5 pb-28 relative overflow-hidden font-sans">
      {/* 1. Mountain Sunset Horizon Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-80 pointer-events-none select-none opacity-60">
        <Image
          src="/scenery/dusk.svg"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0B0A]/40 to-[#0D0B0A]" />
      </div>

      {/* Content Stack */}
      <div className="relative z-10 flex flex-col space-y-6">
        {/* Date & Weather Pill */}
        <div className="flex items-center justify-start gap-2 text-xs font-mono tracking-wider">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1614]/85 backdrop-blur-md border border-white/10 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#E05B27] inline-block animate-pulse" />
            <span className="font-semibold text-white">{shortDate}</span>
            <span className="text-neutral-500">•</span>
            <div className="flex items-center gap-1.5 text-white">
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>24°C Kolkata</span>
            </div>
          </div>
        </div>

        {/* Editorial Greeting & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-white leading-tight">
            Good morning, Arif.
          </h1>
          <p className="text-xs sm:text-sm text-[#A69E94] italic font-serif">
            A focused day builds meaningful progress.
          </p>
        </div>

        {/* Floating Centerpiece Orb with Acoustic Wave Ripples */}
        <div className="relative py-3 flex items-center justify-center">
          {/* Soundwave lines extending to left and right */}
          <div className="absolute inset-x-2 flex items-center justify-between pointer-events-none opacity-70">
            {/* Left soundwave */}
            <div className="flex items-center gap-1">
              <span className="h-2 w-0.5 rounded-full bg-orange-500" />
              <span className="h-4 w-0.5 rounded-full bg-orange-400" />
              <span className="h-7 w-0.5 rounded-full bg-orange-400" />
              <span className="h-10 w-1 rounded-full bg-orange-500 animate-pulse" />
              <span className="h-5 w-0.5 rounded-full bg-orange-400" />
              <span className="h-2 w-0.5 rounded-full bg-orange-500" />
            </div>

            {/* Right soundwave */}
            <div className="flex items-center gap-1">
              <span className="h-2 w-0.5 rounded-full bg-orange-500" />
              <span className="h-5 w-0.5 rounded-full bg-orange-400" />
              <span className="h-10 w-1 rounded-full bg-orange-500 animate-pulse" />
              <span className="h-7 w-0.5 rounded-full bg-orange-400" />
              <span className="h-4 w-0.5 rounded-full bg-orange-400" />
              <span className="h-2 w-0.5 rounded-full bg-orange-500" />
            </div>
          </div>

          {/* Luminous Center Orb */}
          <div className="relative flex items-center justify-center">
            {/* Multi-layered glow halo */}
            <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-orange-600/30 to-amber-500/20 blur-2xl animate-pulse" />
            <div className="relative h-36 w-36 rounded-full p-1 bg-gradient-to-b from-orange-400/40 via-orange-600/20 to-transparent flex items-center justify-center shadow-[0_0_40px_rgba(234,88,12,0.35)]">
              <AppOrb size={132} state={isListening ? "solving" : "breathing"} interactive />
              {/* Inner 4-point star accent */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Sparkles className="h-7 w-7 text-white fill-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Glowing Orange Voice / Action Input Bar */}
        <form onSubmit={handleSend} className="relative">
          <div
            className={`flex items-center gap-3 rounded-full border px-4 py-2.5 bg-[#171311]/90 backdrop-blur-xl transition-all ${
              isListening
                ? "border-orange-500 ring-2 ring-orange-500/40 shadow-[0_0_24px_rgba(249,115,22,0.4)]"
                : "border-[#E05B27]/50 shadow-[0_0_15px_rgba(224,91,39,0.18)] hover:border-[#E05B27]"
            }`}
          >
            {/* Mic Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isListening ? "text-orange-400 animate-pulse" : "text-[#A69E94] hover:text-white"
              }`}
              aria-label="Toggle voice input"
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening to your voice..." : "Tell me what you want to do..."}
              className="flex-1 bg-transparent text-sm text-white placeholder-[#8A8278] focus:outline-none"
            />

            {/* Send Arrow Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                inputText.trim()
                  ? "bg-[#D25828] text-white shadow-md active:scale-90"
                  : "bg-neutral-800 text-neutral-500"
              }`}
              aria-label="Send action"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </div>
        </form>

        {/* 4 Circular Quick Action Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          {/* Add Task */}
          <button
            type="button"
            onClick={onAddTask}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full border border-orange-500/50 bg-[#221712] text-[#E06A3A] flex items-center justify-center shadow-xs transition-transform group-active:scale-90 group-hover:border-orange-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium text-[#C4BCB3]">Add Task</span>
          </button>

          {/* Plan Day */}
          <button
            type="button"
            onClick={onPlanDay}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full border border-white/10 bg-[#1A1614] text-[#A69E94] flex items-center justify-center shadow-xs transition-transform group-active:scale-90 group-hover:border-white/25">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium text-[#C4BCB3]">Plan Day</span>
          </button>

          {/* Capture */}
          <button
            type="button"
            onClick={onQuickCapture}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full border border-white/10 bg-[#1A1614] text-[#A69E94] flex items-center justify-center shadow-xs transition-transform group-active:scale-90 group-hover:border-white/25">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium text-[#C4BCB3]">Capture</span>
          </button>

          {/* Ask AI */}
          <button
            type="button"
            onClick={() => {
              setInputText("Summarize my daily focus and suggest schedule");
              toast.info("Prompt prepared");
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full border border-white/10 bg-[#1A1614] text-[#A69E94] flex items-center justify-center shadow-xs transition-transform group-active:scale-90 group-hover:border-white/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium text-[#C4BCB3]">Ask AI</span>
          </button>
        </div>

        {/* TODAY AT A GLANCE Section */}
        <div className="space-y-3 pt-2">
          <h2 className="text-[10px] font-mono tracking-widest uppercase text-[#8A8278] text-center">
            Today At A Glance
          </h2>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-4 gap-2">
            {/* Card 1: Focus */}
            <div className="p-2.5 rounded-2xl border border-white/8 bg-[#181412] flex flex-col justify-between">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              <div className="mt-2.5">
                <span className="text-xs sm:text-sm font-bold text-white font-mono block">3h 20m</span>
                <span className="text-[9px] text-[#8E867C]">Focus</span>
              </div>
              <div className="mt-2.5 h-1 w-full rounded-full bg-orange-500/60" />
            </div>

            {/* Card 2: Tasks */}
            <div className="p-2.5 rounded-2xl border border-white/8 bg-[#181412] flex flex-col justify-between">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <div className="mt-2.5">
                <span className="text-xs sm:text-sm font-bold text-white font-mono block">
                  {overview.metrics.tasks_completed_today} / {totalTasks || 12}
                </span>
                <span className="text-[9px] text-[#8E867C]">Tasks</span>
              </div>
              <div className="mt-2.5 h-1 w-full rounded-full bg-emerald-500" />
            </div>

            {/* Card 3: Projects */}
            <div className="p-2.5 rounded-2xl border border-white/8 bg-[#181412] flex flex-col justify-between">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <div className="mt-2.5">
                <span className="text-xs sm:text-sm font-bold text-white font-mono block">
                  {overview.metrics.active_projects_count || 3}
                </span>
                <span className="text-[9px] text-[#8E867C]">Projects</span>
              </div>
              <div className="mt-2.5 h-1 w-full rounded-full bg-amber-500" />
            </div>

            {/* Card 4: Targets */}
            <div className="p-2.5 rounded-2xl border border-white/8 bg-[#181412] flex flex-col justify-between">
              <Target className="h-3.5 w-3.5 text-purple-400" />
              <div className="mt-2.5">
                <span className="text-xs sm:text-sm font-bold text-white font-mono block">
                  {targetPercent}%
                </span>
                <span className="text-[9px] text-[#8E867C]">Targets</span>
              </div>
              <div className="mt-2.5 h-1 w-full rounded-full bg-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
