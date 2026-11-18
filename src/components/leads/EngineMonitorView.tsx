"use client";

import * as React from "react";
import { LeadEngineLog, LeadEngineStats } from "@/modules/leads/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  RefreshCw,
  Search,
  Filter,
  Lightbulb,
  Zap,
  Clock,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

export function EngineMonitorView() {
  const [stats, setStats] = React.useState<LeadEngineStats | null>(null);
  const [logs, setLogs] = React.useState<LeadEngineLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [triggeringWorkflow, setTriggeringWorkflow] = React.useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/engine/status");
      if (res.ok) {
        const json = await res.json();
        setStats(json.data.stats);
        setLogs(json.data.recent_logs || []);
      }
    } catch {
      toast.error("Failed to fetch engine telemetry");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isSubscribed = true;
    Promise.resolve().then(async () => {
      if (isSubscribed) {
        await fetchStatus();
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [fetchStatus]);

  const handleTrigger = async (workflow: "discovery" | "filter" | "audit" | "pitch" | "full_run") => {
    setTriggeringWorkflow(workflow);
    try {
      const res = await fetch("/api/v1/engine/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow }),
      });

      if (!res.ok) throw new Error("Trigger request failed");
      const json = await res.json();
      toast.success(json.data.message || `Triggered ${workflow} workflow`);
      await fetchStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Trigger failed";
      toast.error(msg);
    } finally {
      setTriggeringWorkflow(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Funnel Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-1">
          <span className="text-xs text-[var(--muted-foreground)]">Total Discovered</span>
          <p className="text-2xl font-serif text-[var(--foreground)]">{stats?.total_leads ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Pitch Ready (Hot)</span>
          <p className="text-2xl font-serif text-emerald-600 dark:text-emerald-400">{stats?.pitch_ready ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-1">
          <span className="text-xs text-[var(--muted-foreground)]">Contacted Outreaches</span>
          <p className="text-2xl font-serif text-[var(--foreground)]">{stats?.contacted ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-1">
          <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">Converted to Clients</span>
          <p className="text-2xl font-serif text-sky-600 dark:text-sky-400">{stats?.converted ?? 0}</p>
        </div>
      </div>

      {/* Push Triggers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-medium text-sm text-[var(--foreground)]">Manual &amp; Webhook Push Triggers</h3>
          </div>
          <Button size="sm" variant="outline" onClick={fetchStatus} disabled={isLoading} className="gap-1.5 text-xs h-8">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* WF1/WF2 Discovery */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-semibold text-[var(--foreground)]">WF1/WF2: Discovery</h4>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
                Pulls targets from Niche Catalog &amp; Overpass OpenStreetMap geospatial query.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={Boolean(triggeringWorkflow)}
              onClick={() => handleTrigger("discovery")}
              className="text-xs w-full gap-1.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
            >
              <Play className="w-3 h-3" />
              {triggeringWorkflow === "discovery" ? "Triggering..." : "Run Discovery"}
            </Button>
          </div>

          {/* WF3/WF4 Filter & Scrape */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-500" />
                <h4 className="text-xs font-semibold text-[var(--foreground)]">WF3/WF4: Scrape &amp; Filter</h4>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
                Applies Groq AI qualification, drops government/chains, scrapes site intelligence.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={Boolean(triggeringWorkflow)}
              onClick={() => handleTrigger("filter")}
              className="text-xs w-full gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
            >
              <Play className="w-3 h-3" />
              {triggeringWorkflow === "filter" ? "Triggering..." : "Run Filter"}
            </Button>
          </div>

          {/* WF5/WF6 Audit & Pitches */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-semibold text-[var(--foreground)]">WF5/WF6: Audit &amp; Pitch</h4>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
                Audits Lighthouse performance and drafts 65-word consultative WhatsApp copies.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={Boolean(triggeringWorkflow)}
              onClick={() => handleTrigger("pitch")}
              className="text-xs w-full gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <Play className="w-3 h-3" />
              {triggeringWorkflow === "pitch" ? "Triggering..." : "Run Audit &amp; Pitch"}
            </Button>
          </div>

          {/* Full Pipeline */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Full Pipeline Sweep</h4>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
                Executes all 6 stages sequentially with live Supabase database ingestion.
              </p>
            </div>
            <Button
              size="sm"
              disabled={Boolean(triggeringWorkflow)}
              onClick={() => handleTrigger("full_run")}
              className="text-xs w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Play className="w-3 h-3" />
              {triggeringWorkflow === "full_run" ? "Triggering..." : "Run Full Sweep"}
            </Button>
          </div>
        </div>
      </div>

      {/* Execution Logs Stream */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--muted-foreground)]" />
          <h3 className="font-medium text-sm text-[var(--foreground)]">Autonomous Engine Event Log</h3>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
              No recent engine events logged. Trigger a run or wait for scheduled midnight discovery.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {log.component}
                  </Badge>
                  <span className="font-medium text-[var(--foreground)]">{log.event_type}</span>
                  {log.execution_id && (
                    <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                      [{log.execution_id}]
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-[11px]">
                  <Clock className="w-3 h-3" />
                  {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
