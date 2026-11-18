"use client";

import * as React from "react";
import { LeadList } from "./LeadList";
import { TargetingView } from "./TargetingView";
import { EngineMonitorView } from "./EngineMonitorView";
import { Users, Layers, Activity } from "lucide-react";

export function LeadsView() {
  const [activeTab, setActiveTab] = React.useState<"pipeline" | "targeting" | "engine">("pipeline");

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] w-max">
          <button
            type="button"
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.98] cursor-pointer ${
              activeTab === "pipeline"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Pipeline <span className="hidden sm:inline">&amp; Client Cards</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("targeting")}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.98] cursor-pointer ${
              activeTab === "targeting"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>
              Targeting <span className="hidden sm:inline">&amp; Niches</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("engine")}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.98] cursor-pointer ${
              activeTab === "engine"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Engine <span className="hidden sm:inline">Monitor &amp; Triggers</span>
            </span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "pipeline" && <LeadList />}
      {activeTab === "targeting" && <TargetingView />}
      {activeTab === "engine" && <EngineMonitorView />}
    </div>
  );
}
