"use client";

import * as React from "react";
import { Lead, LeadStatus } from "@/modules/leads/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface LeadKanbanViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onStatusChange: (id: string, newStatus: LeadStatus) => Promise<void>;
  onConvert: (id: string) => Promise<void>;
}

const STAGES: { status: LeadStatus; label: string; color: string; border: string }[] = [
  { status: "lead", label: "Pitch Ready", color: "text-amber-500 bg-amber-500/10", border: "border-amber-500/30" },
  { status: "contacted", label: "Contacted", color: "text-sky-500 bg-sky-500/10", border: "border-sky-500/30" },
  { status: "qualified", label: "Qualified", color: "text-indigo-500 bg-indigo-500/10", border: "border-indigo-500/30" },
  { status: "converted", label: "Converted", color: "text-emerald-500 bg-emerald-500/10", border: "border-emerald-500/30" },
  { status: "lost", label: "Lost", color: "text-rose-500 bg-rose-500/10", border: "border-rose-500/30" },
];

export function LeadKanbanView({
  leads,
  onSelectLead,
  onStatusChange,
  onConvert,
}: LeadKanbanViewProps) {
  const [draggedLeadId, setDraggedLeadId] = React.useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = React.useState<LeadStatus | null>(null);

  const getNextStage = (curr: LeadStatus): LeadStatus | null => {
    const idx = STAGES.findIndex((s) => s.status === curr);
    return idx < STAGES.length - 1 ? STAGES[idx + 1].status : null;
  };

  const getPrevStage = (curr: LeadStatus): LeadStatus | null => {
    const idx = STAGES.findIndex((s) => s.status === curr);
    return idx > 0 ? STAGES[idx - 1].status : null;
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent, col: LeadStatus) => {
    e.preventDefault();
    if (dragOverCol !== col) setDragOverCol(col);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (!id) return;

    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.status === targetStatus) return;

    try {
      if (targetStatus === "converted") {
        await onConvert(id);
      } else {
        await onStatusChange(id, targetStatus);
      }
      toast.success(`Moved to ${targetStatus}`);
    } catch {
      toast.error("Failed to move card");
    } finally {
      setDraggedLeadId(null);
    }
  };

  return (
    <div className="overflow-x-auto pb-4 no-scrollbar">
      <div className="flex gap-4 min-w-[1050px]">
        {STAGES.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.status);
          const isOver = dragOverCol === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`flex-1 rounded-2xl border transition-all duration-200 bg-[var(--muted)]/20 p-3 flex flex-col ${
                isOver ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-[var(--accent)]/30" : "border-[var(--border)]"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]/70">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color.split(" ")[0].replace("text-", "bg-")}`} />
                  <h4 className="font-serif font-medium text-sm text-[var(--foreground)]">
                    {col.label}
                  </h4>
                </div>
                <span className="text-xs font-mono text-[var(--muted-foreground)] px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)]">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 min-h-[450px]">
                {colLeads.map((lead) => {
                  const displayName = lead.business_name || lead.company || lead.full_name;
                  const prev = getPrevStage(lead.status);
                  const next = getNextStage(lead.status);

                  const cleanPhone = (lead.phone_formatted || lead.phone || "").replace(/[^\d+]/g, "");
                  const whatsappHref = cleanPhone
                    ? `https://wa.me/${cleanPhone.replace(/\+/g, "")}?text=${encodeURIComponent(
                        lead.tailored_pitch || "Hi, I wanted to reach out regarding your website and booking systems."
                      )}`
                    : null;

                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => onSelectLead(lead)}
                      className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 shadow-2xs hover:shadow-md hover:border-[var(--primary)]/40 transition-all duration-150 cursor-grab active:cursor-grabbing space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-serif font-medium text-xs sm:text-sm text-[var(--foreground)] tracking-tight line-clamp-2">
                          {displayName}
                        </h5>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                          ★ {lead.score}
                        </span>
                      </div>

                      {lead.decision_maker_name && (
                        <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                          {lead.decision_maker_name}
                        </p>
                      )}

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                        {lead.lighthouse_mobile !== undefined && lead.lighthouse_mobile !== null && (
                          <span className="px-1 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Mob: {lead.lighthouse_mobile}
                          </span>
                        )}
                        {lead.cms_detected && (
                          <span className="px-1 py-0.5 rounded bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]">
                            {lead.cms_detected}
                          </span>
                        )}
                      </div>

                      {/* Bottom Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/50 text-xs">
                        <div className="flex items-center gap-1">
                          {prev && (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await onStatusChange(lead.id, prev);
                              }}
                              className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                              title={`Move back to ${prev}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {next && (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (next === "converted") {
                                  await onConvert(lead.id);
                                } else {
                                  await onStatusChange(lead.id, next);
                                }
                              }}
                              className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                              title={`Advance to ${next}`}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {whatsappHref && (
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            title="Open WhatsApp Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colLeads.length === 0 && (
                  <div className="h-32 border border-dashed border-[var(--border)] rounded-xl flex items-center justify-center text-xs text-[var(--muted-foreground)]">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
