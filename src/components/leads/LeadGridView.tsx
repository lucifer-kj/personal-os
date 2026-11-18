"use client";

import * as React from "react";
import { Lead, LeadStatus } from "@/modules/leads/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Smartphone,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  ArrowRight,
  Globe,
  Tag,
  Building2,
  Activity,
  Layers,
} from "lucide-react";

interface LeadGridViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onStatusChange: (id: string, newStatus: LeadStatus) => Promise<void>;
  onConvert: (id: string) => Promise<void>;
}

export function LeadGridView({
  leads,
  onSelectLead,
}: LeadGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
      {leads.map((lead) => {
        const displayName = lead.business_name || lead.company || lead.full_name;
        const decisionMaker = lead.decision_maker_name
          ? `${lead.decision_maker_name}${lead.decision_maker_title ? ` (${lead.decision_maker_title})` : ""}`
          : null;

        const cleanPhone = (lead.phone_formatted || lead.phone || "").replace(/[^\d+]/g, "");
        const whatsappHref = cleanPhone
          ? `https://wa.me/${cleanPhone.replace(/\+/g, "")}?text=${encodeURIComponent(
              lead.tailored_pitch || "Hi, I wanted to reach out regarding your website and booking systems."
            )}`
          : null;

        return (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-[var(--primary)]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            {/* Top Bar: Category Icon Badge & Status */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] group-hover:border-[var(--primary)]/40 transition-colors">
                  <Activity className="w-4 h-4 text-[var(--primary)]" />
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] font-mono uppercase">
                    {lead.status}
                  </Badge>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ★ {lead.score}
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-serif font-semibold text-base text-[var(--foreground)] tracking-tight line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                {displayName}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                {decisionMaker || lead.category || "Commercial Lead"}
              </p>

              {/* Pitch Summary */}
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-2 font-serif italic">
                &ldquo;{lead.tailored_pitch || "Audit revealed page speed bottlenecks and high bounce rate."}&rdquo;
              </p>

              {/* Audit Signal Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {lead.lighthouse_mobile !== undefined && lead.lighthouse_mobile !== null && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10.5px] font-mono border border-rose-500/20">
                    <Smartphone className="w-2.5 h-2.5" />
                    {lead.lighthouse_mobile}/100
                  </span>
                )}
                {lead.cms_detected && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--muted)] text-[10.5px] font-mono text-[var(--foreground)] border border-[var(--border)]">
                    {lead.cms_detected}
                  </span>
                )}
                {lead.has_ssl && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-mono">
                    <ShieldCheck className="w-2.5 h-2.5" /> SSL
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-[var(--border)]/60 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[var(--primary)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Learn more
                <ArrowRight className="w-3.5 h-3.5" />
              </span>

              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium active:scale-95 transition-all border border-emerald-500/20 cursor-pointer"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
