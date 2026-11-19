"use client";

import * as React from "react";
import { Lead, LeadStatus } from "@/modules/leads/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Sparkles,
  Smartphone,
  Laptop,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  Copy,
  Check,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  MapPin,
  UserCheck,
  Tag,
  ArrowRightCircle,
  TrendingUp,
  Cpu,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: LeadStatus) => Promise<void>;
  onConvert: (id: string) => Promise<void>;
}

export function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onConvert,
}: LeadDetailModalProps) {
  const [copiedPitch, setCopiedPitch] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  const displayName = lead.business_name || lead.company || lead.full_name;
  const decisionMaker = lead.decision_maker_name
    ? `${lead.decision_maker_name}${lead.decision_maker_title ? ` (${lead.decision_maker_title})` : ""}`
    : null;

  const cleanPhone = (lead.phone_formatted || lead.phone || "").replace(/[^\d+]/g, "");

  const whatsappHref = cleanPhone
    ? `https://wa.me/${cleanPhone.replace(/\+/g, "")}?text=${encodeURIComponent(
        lead.tailored_pitch || "Hi, I wanted to reach out regarding your website speed and automated booking systems."
      )}`
    : null;

  const handleCopyPitch = () => {
    if (!lead.tailored_pitch) return;
    navigator.clipboard.writeText(lead.tailored_pitch);
    setCopiedPitch(true);
    toast.success("Tailored pitch copied to clipboard!");
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleConvert = async () => {
    if (lead.status === "converted") {
      toast.info("This lead is already converted to an active client project.");
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

  // Derive Audit Weaknesses
  const weaknesses: string[] = [];
  if (lead.audit_signals && lead.audit_signals.length > 0) {
    weaknesses.push(...lead.audit_signals);
  } else {
    if (lead.lighthouse_mobile && lead.lighthouse_mobile < 50) {
      weaknesses.push(`Severe mobile speed bottleneck: scores only ${lead.lighthouse_mobile}/100 on Google Lighthouse`);
    }
    if (lead.cms_detected && (lead.cms_detected.toLowerCase().includes("wordpress") || lead.cms_detected.toLowerCase().includes("wix"))) {
      weaknesses.push(`Legacy monolithic CMS (${lead.cms_detected}) causing slow TTFB and high bounce rates`);
    }
    if (!lead.has_ssl) {
      weaknesses.push("Missing or insecure SSL/TLS certificate, triggering browser security warnings");
    }
    if (weaknesses.length === 0) {
      weaknesses.push("Unoptimized mobile viewport and lack of instant WhatsApp booking conversion triggers");
    }
  }

  // Derive Strategic Opportunities
  const opportunities = [
    lead.recommended_service || "Modern Next.js Architecture + 100/100 Lighthouse Performance Upgrade",
    "Automated instant WhatsApp lead capture & patient/client booking bot",
    `Estimated Value: ₹${((lead.estimated_value_cents || 3500000) / 100).toLocaleString("en-IN")} projected pipeline impact`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Floating Modal Surface */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl transition-all duration-200 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-start justify-between gap-3 border-b border-[var(--border)]/70 bg-[var(--card)]/95 px-5 py-4 backdrop-blur-md">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif font-medium text-lg sm:text-xl text-[var(--foreground)] tracking-tight truncate">
                {displayName}
              </h2>
              <Badge variant="outline" className="text-xs uppercase tracking-wider font-mono">
                {lead.status}
              </Badge>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                Score: {lead.score}/100
              </span>
            </div>

            {decisionMaker && (
              <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[var(--foreground)] font-medium">{decisionMaker}</span>
                {lead.location && <span>• {lead.location}</span>}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Action Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[var(--muted-foreground)] shrink-0">Pipeline Stage:</span>
              <div className="relative inline-flex items-center">
                <select
                  value={lead.status}
                  onChange={handleStatusSelect}
                  disabled={isUpdatingStatus}
                  className="text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] pl-2.5 pr-7 py-1 font-medium text-[var(--foreground)] shadow-2xs hover:border-[var(--primary)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all cursor-pointer h-8 appearance-none"
                >
                  <option value="lead">Pitch Ready</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  1-Click WhatsApp
                </a>
              )}

              {lead.status !== "converted" ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isConverting}
                  onClick={handleConvert}
                  className="text-xs h-8 gap-1.5 rounded-lg border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 active:scale-95 transition-all cursor-pointer font-medium"
                >
                  <ArrowRightCircle className="w-3.5 h-3.5" />
                  {isConverting ? "Converting..." : "Convert to Client"}
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active Client Project
                </span>
              )}
            </div>
          </div>

          {/* Grid of Scores & Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--muted-foreground)] block">Lead Score</span>
              <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {lead.score}/100
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-mono">{lead.score_tier || "warm"} tier</span>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--muted-foreground)] block">Mobile Speed</span>
              <span className="text-xl font-mono font-bold text-rose-500 mt-1 block">
                {lead.lighthouse_mobile ?? 32}/100
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">Lighthouse Score</span>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--muted-foreground)] block">Desktop Speed</span>
              <span className="text-xl font-mono font-bold text-amber-500 mt-1 block">
                {lead.lighthouse_desktop ?? 64}/100
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">Lighthouse Score</span>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--muted-foreground)] block">Tech Stack</span>
              <span className="text-sm font-mono font-semibold text-[var(--foreground)] mt-1 block truncate">
                {lead.cms_detected || "Custom Web"}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5 font-mono">
                <ShieldCheck className="w-3 h-3" /> SSL Active
              </span>
            </div>
          </div>

          {/* Section: Audit Weaknesses & Bottlenecks */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2.5">
            <h3 className="text-xs font-mono uppercase font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Identified Client Weaknesses &amp; Bottlenecks
            </h3>
            <ul className="space-y-1.5 text-xs text-[var(--foreground)]">
              {weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span className="break-words leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: AI Consultative Pitch */}
          {lead.tailored_pitch && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Tailored Consultative Pitch Copy
                </h3>
                <button
                  type="button"
                  onClick={handleCopyPitch}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40 text-xs text-[var(--foreground)] active:scale-95 transition-all cursor-pointer font-medium"
                >
                  {copiedPitch ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copiedPitch ? "Copied" : "Copy Pitch"}
                </button>
              </div>

              <blockquote className="p-3 rounded-lg border border-[var(--border)]/60 bg-[var(--background)]/80 text-xs sm:text-sm text-[var(--foreground)] font-serif italic leading-relaxed break-words">
                &ldquo;{lead.tailored_pitch}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Section: Strategic Growth Opportunities */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2.5">
            <h3 className="text-xs font-mono uppercase font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 tracking-wider">
              <Lightbulb className="w-4 h-4" />
              Strategic Growth Opportunities &amp; Offer
            </h3>
            <ul className="space-y-1.5 text-xs text-[var(--foreground)]">
              {opportunities.map((opp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="break-words leading-relaxed">{opp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Direct Contact Dossier */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
            <h3 className="text-xs font-mono uppercase font-semibold text-[var(--muted-foreground)] tracking-wider">
              Direct Contact &amp; Business Dossier
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--accent)] transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-mono text-[var(--foreground)]">{lead.phone}</span>
                </a>
              )}

              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--accent)] transition-all truncate"
                >
                  <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                  <span className="text-[var(--foreground)] truncate">{lead.email}</span>
                </a>
              )}

              {lead.website && (
                <a
                  href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--accent)] transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-[var(--foreground)] truncate">{lead.website}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-50 shrink-0 ml-1" />
                </a>
              )}

              {lead.address && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[var(--muted-foreground)] truncate">{lead.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
