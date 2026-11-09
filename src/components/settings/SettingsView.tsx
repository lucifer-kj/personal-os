"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Database,
  ShieldCheck,
  CheckCircle2,
  FolderKanban,
  Flame,
  Radio,
  Loader2,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { SecuritySettingsCard } from "./SecuritySettingsCard";
import { DeviceManagementCard } from "./DeviceManagementCard";

export function SettingsView() {
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [seedResult, setSeedResult] = React.useState<string | null>(null);

  const handleSeedEnclave = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/v1/enclave/seed", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        toast.success("Enclave initialized with your ongoing projects, habits, and feeds!");
        const r = json.data?.results;
        setSeedResult(
          `Created ${r?.projectsCreated ?? 0} projects (NBD, ACoV, Fossil, Friday), ${r?.habitsCreated ?? 0} habits, and ${r?.feedsCreated ?? 0} feeds.`
        );
      } else {
        toast.error(json.error || "Failed to initialize enclave");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      toast.error(msg);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* 1. Single-User Enclave Status Card */}
      <Card className="p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#262220] shadow-2xs rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-serif font-medium text-[#24211F] dark:text-[#F3EFEA]">
                Single-User Enclave
              </h2>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px] font-mono">
                Active & Secured
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7269] dark:text-[#A69E94]">
              Personal OS runs in private enclave mode claimed by verified owner <code className="font-mono text-xs text-[#E05B27]">321arifali@gmail.com</code>. Multi-tenant signups are strictly blocked by PostgreSQL trigger.
            </p>
          </div>
        </div>
      </Card>

      {/* 2. Two-Factor & Biometric Security Card */}
      <SecuritySettingsCard />

      {/* 3. Device & Workstation Session Management */}
      <DeviceManagementCard />

      {/* 4. One-Click Database Seeding Card */}
      <Card className="p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#262220] shadow-2xs rounded-2xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[#E05B27]" />
              <h2 className="text-base sm:text-lg font-serif font-medium text-[#24211F] dark:text-[#F3EFEA]">
                Populate Workspace Interests
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7269] dark:text-[#A69E94]">
              Initialize your workspace with your ongoing projects, consistency habits, and intelligence feeds in one click without creating them manually.
            </p>
          </div>

          <Button
            onClick={handleSeedEnclave}
            disabled={isSeeding}
            className="shrink-0 bg-[#E05B27] hover:bg-[#C94D1D] text-white gap-2 shadow-xs cursor-pointer"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Populate My Interests</span>
          </Button>
        </div>

        {/* Blueprint Breakdown Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#EDE7DE] dark:border-[#2A2624] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA]">
              <FolderKanban className="h-4 w-4 text-[#E05B27]" />
              <span>4 Ongoing Projects</span>
            </div>
            <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94]">
              <strong>NBD</strong>, <strong>ACoV</strong>, <strong>Fossil</strong>, and <strong>Friday</strong> with structured deliverables.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#EDE7DE] dark:border-[#2A2624] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA]">
              <Flame className="h-4 w-4 text-[#2563EB]" />
              <span>Daily Consistency Habits</span>
            </div>
            <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94]">
              Deep work sprint, milestone reviews, high-signal reading, and evening reflection.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#EDE7DE] dark:border-[#2A2624] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA]">
              <Radio className="h-4 w-4 text-[#D97706]" />
              <span>Curated Radar Feeds</span>
            </div>
            <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94]">
              Hacker News, Simon Willison's Weblog, and GitHub Engineering blog.
            </p>
          </div>
        </div>

        {seedResult && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{seedResult}</span>
          </div>
        )}
      </Card>
    </div>
  );
}
