"use client";

import * as React from "react";
import { X, Sparkles, Monitor, Smartphone, Sun, Moon, CheckCircle2, Flame, Play, Eye } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { AppOrb, OrbState } from "@/components/brand/AppOrb";
import { fireCelebrationConfetti } from "@/lib/ui/confetti";
import { Button } from "@/components/ui/button";

interface StatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenery?: (scenery: "dawn" | "day" | "dusk" | "night" | null) => void;
}

export function StatePreviewModal({ isOpen, onClose, onSelectScenery }: StatePreviewModalProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [selectedOrbState, setSelectedOrbState] = React.useState<OrbState>("breathing");
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "mobile">("desktop");
  const [activeWorkflowState, setActiveWorkflowState] = React.useState<"normal" | "empty" | "complete" | "focus">("normal");

  if (!isOpen) return null;

  const orbStates: { state: OrbState; label: string; desc: string }[] = [
    { state: "breathing", label: "Breathing (Resting)", desc: "Calm, ambient resting orb" },
    { state: "working", label: "Working (Deep Focus)", desc: "Deep work & focused session" },
    { state: "weaving", label: "Weaving (Ideation)", desc: "Notes linking & content drafting" },
    { state: "solving", label: "Solving (Processing)", desc: "Active synthesis & computing" },
  ];

  const handleTriggerCelebration = () => {
    setActiveWorkflowState("complete");
    fireCelebrationConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#161413] border border-[#EDE7DE] dark:border-[#2A2624] shadow-2xl p-6 z-10 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE7DE] dark:border-[#262220]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#FFF4ED] dark:bg-[#2C1C15] text-[#B94A24] dark:text-[#E07A50] flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif font-medium text-lg text-[#24211F] dark:text-[#F3EFEA]">
                State Preview Studio
              </h2>
              <p className="text-xs text-[#7A7269] dark:text-[#A69E94]">
                Test interactive design states, orb temperature, and device responsive modes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7269] hover:text-[#24211F] dark:text-[#A69E94] dark:hover:text-white hover:bg-[#F2ECE3] dark:hover:bg-[#1E1B19] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Device Viewport Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#7A7269] dark:text-[#A69E94]">
            Device Simulation Target
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                previewDevice === "desktop"
                  ? "bg-[#B94A24] text-white border-[#B94A24] shadow-xs"
                  : "bg-[#F7F4EF] dark:bg-[#1C1917] border-[#EDE7DE] dark:border-[#2A2624] text-[#5C554E] dark:text-[#A69E94]"
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>Desktop (Light Editorial Default)</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                previewDevice === "mobile"
                  ? "bg-[#B94A24] text-white border-[#B94A24] shadow-xs"
                  : "bg-[#F7F4EF] dark:bg-[#1C1917] border-[#EDE7DE] dark:border-[#2A2624] text-[#5C554E] dark:text-[#A69E94]"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Mobile (Dark Obsidian Default)</span>
            </button>
          </div>
        </div>

        {/* 2. Theme Mode Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#7A7269] dark:text-[#A69E94]">
            Theme Override
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-all ${
                resolvedTheme === "light"
                  ? "bg-[#F5EBE1] text-[#A84A28] border-[#E8DFD5] font-semibold"
                  : "bg-white dark:bg-[#1A1715] border-[#EDE7DE] dark:border-[#262220] text-[#7A7269]"
              }`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-all ${
                resolvedTheme === "dark"
                  ? "bg-[#2C1C15] text-[#E87A54] border-[#42291E] font-semibold"
                  : "bg-white dark:bg-[#1A1715] border-[#EDE7DE] dark:border-[#262220] text-[#7A7269]"
              }`}
            >
              <Moon className="h-4 w-4 text-orange-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* 3. Thinking Orb State Visualizer */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#7A7269] dark:text-[#A69E94]">
            Thinking Orb Interactive Engine
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {orbStates.map((item) => (
              <button
                key={item.state}
                type="button"
                onClick={() => setSelectedOrbState(item.state)}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                  selectedOrbState === item.state
                    ? "border-[#B94A24] bg-[#FFF4ED] dark:bg-[#2C1C15] text-[#A84A28] dark:text-[#E87A54] font-semibold"
                    : "border-[#EDE7DE] dark:border-[#2A2624] bg-white dark:bg-[#1C1917] text-[#7A7269] dark:text-[#A69E94]"
                }`}
              >
                <AppOrb size={44} state={item.state} interactive />
                <span className="text-[11px] font-medium leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Workflow State Triggers */}
        <div className="space-y-2 pt-1 border-t border-[#EDE7DE] dark:border-[#262220]">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#7A7269] dark:text-[#A69E94]">
            Workflow Micro-Interactions
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTriggerCelebration}
              className="h-8 rounded-full text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Trigger Celebration Confetti</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (onSelectScenery) onSelectScenery("dawn");
                onClose();
              }}
              className="h-8 rounded-full text-xs gap-1.5"
            >
              <Sun className="h-3.5 w-3.5 text-orange-500" />
              <span>Preview Dawn Horizon</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (onSelectScenery) onSelectScenery("night");
                onClose();
              }}
              className="h-8 rounded-full text-xs gap-1.5"
            >
              <Moon className="h-3.5 w-3.5 text-purple-400" />
              <span>Preview Night Horizon</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
