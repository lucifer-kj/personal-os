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
}

export function LeadCard({ lead, onStatusChange, onConvert }: LeadCardProps) {
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
    <div className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-[var(--primary)]/30 hover:shadow-md hover:-translate-y-0.5">
      {/* Top Bar: Identity & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif font-medium text-base sm:text-lg text-[var(--foreground)] tracking-tight">
              {displayName}
            </h3>
            {getStatusBadge(lead.status)}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono tabular-nums font-semibold border ${getScoreColor(
                lead.score
              )}`}
              title="Calculated Lead Quality Score"
            >
              <Sparkles className="w-3 h-3" />
              {lead.score}/100
            </span>

            {/* Lighthouse Mobile Gauge */}
            {lead.lighthouse_mobile !== undefined && lead.lighthouse_mobile !== null && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono tabular-nums font-medium border ${getLighthouseColor(
                  lead.lighthouse_mobile
                )}`}
                title="Google Lighthouse Mobile Performance Score"
              >
                <Smartphone className="w-3 h-3" />
                Mobile: {lead.lighthouse_mobile}/100
              </span>
            )}
          </div>

          {/* Decision Maker & Niche Metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--muted-foreground)]">
            {decisionMaker && (
              <span className="inline-flex items-center gap-1 text-[var(--foreground)] font-medium">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                {decisionMaker}
              </span>
            )}
            {(lead.category || lead.subcategory) && (
              <span className="inline-flex items-center gap-1">
                <Tag className="w-3 h-3 opacity-60" />
                {lead.category}{lead.subcategory ? ` > ${lead.subcategory}` : ""}
              </span>
            )}
            {lead.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 opacity-60" />
                {lead.location}
              </span>
            )}
            {lead.cms_detected && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--muted)] text-[11px] font-mono border border-[var(--border)]">
                {lead.cms_detected}
              </span>
            )}
            {lead.has_ssl && (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
                <ShieldCheck className="w-3 h-3" /> SSL
              </span>
            )}
          </div>
        </div>

        {/* Action Controls: Status & Convert */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
          <select
            value={lead.status}
            onChange={handleStatusSelect}
            disabled={isUpdatingStatus}
            className="text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 font-medium text-[var(--foreground)] shadow-2xs hover:border-[var(--primary)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all cursor-pointer"
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
              className="text-xs h-8 gap-1.5 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 active:scale-95 dark:text-emerald-400 transition-all cursor-pointer"
            >
              <ArrowRightCircle className="w-3.5 h-3.5" />
              {isConverting ? "Converting..." : "Convert"}
            </Button>
          ) : (
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              Active Client
            </span>
          )}
        </div>
      </div>

      {/* Contact Quicklinks Bar */}
      <div className="mt-3.5 pt-3 border-t border-[var(--border)]/60 flex flex-wrap items-center gap-2 text-xs">
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium active:scale-95 transition-all shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            1-Click WhatsApp
          </a>
        )}

        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)] active:scale-95 transition-all"
          >
            <Phone className="w-3 h-3 opacity-60" />
            {lead.phone}
          </a>
        )}

        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)] active:scale-95 transition-all"
          >
            <Mail className="w-3 h-3 opacity-60" />
            {lead.email}
          </a>
        )}

        {lead.website && (
          <a
            href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)] active:scale-95 transition-all"
          >
            <Globe className="w-3 h-3 opacity-60" />
            Website
            <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </a>
        )}

        {lead.tailored_pitch && (
          <button
            type="button"
            onClick={() => setShowPitch(!showPitch)}
            className="inline-flex items-center gap-1 ml-auto text-xs text-[var(--primary)] hover:underline font-medium cursor-pointer"
          >
            {showPitch ? "Hide Pitch" : "View Pitch"}
            {showPitch ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Consultative Pitch Drawer */}
      {showPitch && lead.tailored_pitch && (
        <div className="mt-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
            <span className="flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Tailored Consultative Copy ({lead.recommended_service || "Automated Solution"})
            </span>
            <button
              type="button"
              onClick={handleCopyPitch}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[var(--card)] border border-transparent hover:border-[var(--border)] text-[var(--foreground)] active:scale-95 transition-all cursor-pointer"
            >
              {copiedPitch ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
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
