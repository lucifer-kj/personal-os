"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Lead } from "@/modules/leads/types";

interface OutreachPulseWidgetProps {
  className?: string;
}

export function OutreachPulseWidget({ className = "" }: OutreachPulseWidgetProps) {
  const [hotLeads, setHotLeads] = React.useState<Lead[]>([]);
  const [totalReady, setTotalReady] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    fetch("/api/v1/leads?limit=3")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((json) => {
        if (!isMounted) return;
        const leads: Lead[] = json.data || [];
        setHotLeads(leads.slice(0, 2));
        setTotalReady(json.meta?.total_count || leads.length);
      })
      .catch(() => {
        // Fallback for offline or test environments
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card className={`group p-5 bg-[var(--card)] border-[var(--border)] shadow-xs rounded-2xl flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${className}`}>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Outreach Pulse
            </span>
          </div>

          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline active:scale-95 transition-all"
          >
            <span>Pipeline ({totalReady})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="mt-4 space-y-2.5">
          {isLoading ? (
            <div className="py-4 text-center text-xs text-[var(--muted-foreground)]">
              Scanning client pipeline...
            </div>
          ) : hotLeads.length === 0 ? (
            <div className="py-3 text-xs text-[var(--muted-foreground)] text-center">
              No pending leads. Trigger discovery from the{" "}
              <Link href="/leads" className="text-emerald-500 underline font-medium">
                Leads Engine
              </Link>
              .
            </div>
          ) : (
            hotLeads.map((lead) => (
              <Link
                key={lead.id}
                href="/leads"
                className="block p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-emerald-500/40 hover:shadow-xs active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-medium text-[var(--foreground)] truncate">
                    {lead.business_name || lead.full_name}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    {lead.score}/100
                  </span>
                </div>
                {lead.recommended_service && (
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1 truncate">
                    {lead.recommended_service}
                  </p>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3 text-emerald-500" />
          WhatsApp pitches ready
        </span>
        <Link href="/leads" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
          Open CRM &rarr;
        </Link>
      </div>
    </Card>
  );
}
