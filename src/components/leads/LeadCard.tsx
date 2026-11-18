"use client";

import * as React from "react";
import { Lead, LeadStatus } from "@/modules/leads/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  MapPin,
  Tag,
  ArrowRightCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (id: string, newStatus: LeadStatus) => Promise<void>;
  onConvert: (id: string) => Promise<void>;
  onSelectLead?: (lead: Lead) => void;
}

export function LeadCard({ lead, onStatusChange, onConvert, onSelectLead }: LeadCardProps) {
  const [isConverting, setIsConverting] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [showPitch, setShowPitch] = React.useState(false);
  const [copiedPitch, setCopiedPitch] = React.useState(false);

  const displayName = lead.business_name || lead.company || lead.full_name;
  const decisionMaker = lead.decision_maker_name
    ? `${lead.decision_maker_name}${lead.decision_maker_title ? ` (${lead.decision_maker_title})` : ""}`
    : null;

  const cleanPhone = (lead.phone_formatted || lead.phone || "").replace(/[^\d+]/g, "");

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
        return <Badge variant="outline">Pitch Ready</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-[var(--muted-foreground)] bg-[var(--muted)] border-[var(--border)]";
  };

  const getLighthouseColor = (score?: number | null) => {
    if (score === undefined || score === null) return null;
    if (score >= 70) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
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

  const handleCopyPitch = () => {
    if (!lead.tailored_pitch) return;
    navigator.clipboard.writeText(lead.tailored_pitch);
    setCopiedPitch(true);
    toast.success("WhatsApp pitch copied to clipboard!");
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const whatsappHref = React.useMemo(() => {
    if (!cleanPhone) return null;
    const text = encodeURIComponent(lead.tailored_pitch || "Hi, I wanted to reach out regarding your website and booking systems.");
    const phoneDigits = cleanPhone.replace(/\+/g, "");
    return `https://wa.me/${phoneDigits}?text=${text}`;
  }, [cleanPhone, lead.tailored_pitch]);

  return (
    <div className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-3.5 shadow-2xs transition-all duration-150 hover:border-[var(--primary)]/40 hover:shadow-xs active:scale-[0.997]">
      {/* Primary Row: Identity, Badges, and Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Left Section: Title & Inline Badges */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h3
              onClick={() => onSelectLead?.(lead)}
              className={`font-serif font-medium text-sm sm:text-base text-[var(--foreground)] tracking-tight truncate max-w-xs sm:max-w-md ${
                onSelectLead ? "cursor-pointer hover:text-[var(--primary)] transition-colors" : ""
              }`}
            >
              {displayName}
            </h3>

            {getStatusBadge(lead.status)}

            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums font-semibold border ${getScoreColor(
                lead.score
              )}`}
              title="Calculated Lead Quality Score"
            >
              <Sparkles className="w-2.5 h-2.5" />
              {lead.score}/100
            </span>

            {/* Lighthouse Mobile Gauge */}
            {lead.lighthouse_mobile !== undefined && lead.lighthouse_mobile !== null && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums font-medium border ${getLighthouseColor(
                  lead.lighthouse_mobile
                )}`}
                title="Google Lighthouse Mobile Performance Score"
              >
                <Smartphone className="w-2.5 h-2.5" />
                Mobile: {lead.lighthouse_mobile}/100
              </span>
            )}
          </div>

          {/* Secondary Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs text-[var(--muted-foreground)]">
            {decisionMaker && (
              <span className="inline-flex items-center gap-1 text-[var(--foreground)] font-medium">
                <UserCheck className="w-3 h-3 text-emerald-500" />
                {decisionMaker}
              </span>
            )}
            {(lead.category || lead.subcategory) && (
              <span className="inline-flex items-center gap-1 font-mono text-[10.5px]">
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {lead.category}{lead.subcategory ? ` > ${lead.subcategory}` : ""}
              </span>
            )}
            {lead.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 opacity-60" />
                {lead.location}
              </span>
            )}
            {lead.cms_detected && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-[var(--muted)] text-[10px] font-mono border border-[var(--border)]">
                {lead.cms_detected}
              </span>
            )}
            {lead.has_ssl && (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono">
                <ShieldCheck className="w-2.5 h-2.5" /> SSL
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Compact Tactile Actions */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 pt-1 md:pt-0">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-medium active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              1-Click WhatsApp
            </a>
          )}

          <select
            value={lead.status}
            onChange={handleStatusSelect}
            disabled={isUpdatingStatus}
            className="text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-medium text-[var(--foreground)] shadow-2xs hover:border-[var(--primary)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all cursor-pointer h-7"
          >
            <option value="lead">Pitch Ready</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          {lead.status !== "converted" ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isConverting}
              onClick={handleConvert}
              className="text-xs h-7 px-2.5 gap-1 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 active:scale-95 dark:text-emerald-400 transition-all cursor-pointer font-medium"
            >
              <ArrowRightCircle className="w-3 h-3" />
              {isConverting ? "Converting..." : "Convert"}
            </Button>
          ) : (
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              Active Client
            </span>
          )}

          {lead.tailored_pitch && (
            <button
              type="button"
              onClick={() => setShowPitch(!showPitch)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 text-xs text-[var(--foreground)] active:scale-95 transition-all cursor-pointer h-7 font-medium"
            >
              {showPitch ? "Hide Pitch" : "View Pitch"}
              {showPitch ? <ChevronUp className="w-3 h-3 text-[var(--muted-foreground)]" /> : <ChevronDown className="w-3 h-3 text-[var(--muted-foreground)]" />}
            </button>
          )}
        </div>
      </div>

      {/* Tertiary Contact Bar (Phone, Email, Web) */}
      {(lead.phone || lead.email || lead.website) && (
        <div className="mt-2 pt-2 border-t border-[var(--border)]/50 flex flex-wrap items-center gap-1.5 text-xs">
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--muted)]/70 hover:bg-[var(--accent)] border border-[var(--border)]/70 text-[11px] text-[var(--foreground)] active:scale-95 transition-all"
            >
              <Phone className="w-2.5 h-2.5 opacity-60" />
              {lead.phone}
            </a>
          )}

          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--muted)]/70 hover:bg-[var(--accent)] border border-[var(--border)]/70 text-[11px] text-[var(--foreground)] active:scale-95 transition-all"
            >
              <Mail className="w-2.5 h-2.5 opacity-60" />
              {lead.email}
            </a>
          )}

          {lead.website && (
            <a
              href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--muted)]/70 hover:bg-[var(--accent)] border border-[var(--border)]/70 text-[11px] text-[var(--foreground)] active:scale-95 transition-all"
            >
              <Globe className="w-2.5 h-2.5 opacity-60" />
              Website
              <ExternalLink className="w-2 h-2 opacity-50" />
            </a>
          )}
        </div>
      )}

      {/* Consultative Pitch Drawer */}
      {showPitch && lead.tailored_pitch && (
        <div className="mt-2 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Tailored Consultative Copy ({lead.recommended_service || "Automated Solution"})
            </span>
            <button
              type="button"
              onClick={handleCopyPitch}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[var(--card)] border border-transparent hover:border-[var(--border)] text-[11px] text-[var(--foreground)] active:scale-95 transition-all cursor-pointer font-medium"
            >
              {copiedPitch ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
              {copiedPitch ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-[var(--foreground)] italic font-serif leading-relaxed">
            &ldquo;{lead.tailored_pitch}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
