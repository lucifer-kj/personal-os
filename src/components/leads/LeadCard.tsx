"use client";

import * as React from "react";
import { Lead, LeadStatus } from "@/modules/leads/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  ArrowRightCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (id: string, newStatus: LeadStatus) => Promise<void>;
  onConvert: (id: string) => Promise<void>;
}

export function LeadCard({ lead, onStatusChange, onConvert }: LeadCardProps) {
  const [isConverting, setIsConverting] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "converted":
        return <Badge variant="success">Converted</Badge>;
      case "qualified":
        return <Badge variant="accent">Qualified</Badge>;
      case "contacted":
        return <Badge variant="secondary">Contacted</Badge>;
      case "lost":
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="outline">New Lead</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-[var(--muted-foreground)] bg-[var(--muted)] border-[var(--border)]";
  };

  const handleConvert = async () => {
    if (lead.status === "converted") {
      toast.info("This lead is already converted to a client project.");
      return;
    }
    setIsConverting(true);
    try {
      await onConvert(lead.id);
      toast.success("Lead converted to Client Project & Discovery Task!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Conversion failed";
      toast.error(msg);
    } finally {
      setIsConverting(false);
    }
  };

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as LeadStatus;
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(lead.id, nextStatus);
      toast.success(`Status updated to ${nextStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Lead Info */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-base text-[var(--foreground)] tracking-tight">
              {lead.full_name}
            </h3>
            {getStatusBadge(lead.status)}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold border ${getScoreColor(
                lead.score
              )}`}
              title="Calculated Lead Quality Score"
            >
              <Sparkles className="w-3 h-3" />
              {lead.score}/100
            </span>
          </div>

          {(lead.company || lead.job_title) && (
            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              {lead.company && (
                <span className="flex items-center gap-1 font-medium text-[var(--foreground)]">
                  <Building2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                  {lead.company}
                </span>
              )}
              {lead.company && lead.job_title && <span>•</span>}
              {lead.job_title && <span>{lead.job_title}</span>}
            </div>
          )}

          {/* Contact Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs text-[var(--muted-foreground)]">
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {lead.email}
              </a>
            )}
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {lead.phone}
              </a>
            )}
            {lead.linkedin_url && (
              <a
                href={lead.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                LinkedIn
              </a>
            )}
            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Website
              </a>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
          <select
            value={lead.status}
            onChange={handleStatusSelect}
            disabled={isUpdatingStatus}
            className="text-xs bg-[var(--background)] border border-[var(--border)] rounded-md px-2 py-1 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            <option value="lead">Lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          {lead.status !== "converted" ? (
            <Button
              variant="default"
              size="sm"
              disabled={isConverting}
              onClick={handleConvert}
              className="text-xs font-medium bg-[#1e232d] hover:bg-[#2b3240] text-[#e2d5c3] border border-[#3e4658]"
            >
              <ArrowRightCircle className="w-3.5 h-3.5 mr-1" />
              {isConverting ? "Converting..." : "Convert to Client"}
            </Button>
          ) : (
            <span className="text-[11px] font-mono text-emerald-500 font-medium">
              ✓ Active Client
            </span>
          )}
        </div>
      </div>

      {/* Expandable Notes / Source footer */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
        <div className="flex items-center gap-3">
          <span className="font-mono uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-[var(--muted)]">
            via {lead.source}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(lead.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {lead.notes && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[var(--foreground)] hover:underline"
          >
            {showDetails ? "Hide Notes" : "View Notes"}
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {showDetails && lead.notes && (
        <div className="mt-2 p-2.5 rounded-lg bg-[var(--background)] text-xs text-[var(--muted-foreground)] border border-[var(--border)]/70 whitespace-pre-wrap">
          {lead.notes}
        </div>
      )}
    </div>
  );
}
