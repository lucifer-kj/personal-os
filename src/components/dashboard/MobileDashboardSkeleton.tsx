import * as React from "react";

export function MobileDashboardSkeleton() {
  return (
    <div className="lg:hidden min-h-[calc(100vh-var(--header-height))] bg-[#0D0B0A] text-white -mx-4 -mt-4 px-4 pt-5 pb-28 relative overflow-hidden font-sans animate-pulse">
      {/* 1. Subtle Horizon Atmosphere Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none select-none bg-gradient-to-b from-[#E05B27]/10 via-[#0D0B0A]/40 to-[#0D0B0A]" />

      {/* 2. Content Stack */}
      <div className="relative z-10 flex flex-col space-y-6 max-w-lg mx-auto w-full">
        {/* Date & Status Pill */}
        <div className="flex items-center justify-start">
          <div className="h-6 w-36 rounded-full bg-white/10 border border-white/10" />
        </div>

        {/* Greeting & Quote Placeholder */}
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-white/10" />
          <div className="h-4 w-72 rounded bg-white/5" />
        </div>

        {/* Thinking Orb Placeholder */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            {/* Ambient Pulse Ring */}
            <div className="absolute h-44 w-44 rounded-full bg-[#E05B27]/15 blur-xl" />
            {/* Center Orb */}
            <div className="h-32 w-32 rounded-full border border-[#E05B27]/30 bg-gradient-to-b from-[#E05B27]/25 to-transparent flex items-center justify-center shadow-[0_0_30px_rgba(224,91,39,0.2)]">
              <div className="h-12 w-12 rounded-full bg-white/15" />
            </div>
          </div>
        </div>

        {/* Input Bar Placeholder */}
        <div className="w-full h-12 rounded-full bg-[#161311] border border-white/10 flex items-center px-4 gap-3">
          <div className="h-5 w-5 rounded-full bg-white/15 shrink-0" />
          <div className="h-4 w-40 rounded bg-white/10" />
        </div>

        {/* 4 Quick Action Circles */}
        <div className="grid grid-cols-4 gap-3 text-center pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10" />
              <div className="h-3 w-12 rounded bg-white/10" />
            </div>
          ))}
        </div>

        {/* Today at a Glance Header */}
        <div className="pt-2">
          <div className="h-3 w-28 rounded bg-white/10 mb-3" />
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-[#161311] border border-white/10 flex flex-col justify-between space-y-2 min-h-[76px]"
              >
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 rounded bg-white/15" />
                  <div className="h-3 w-10 rounded bg-white/10" />
                </div>
                <div className="h-5 w-12 rounded bg-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
