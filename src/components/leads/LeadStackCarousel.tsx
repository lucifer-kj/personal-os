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
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Tag,
  Building2,
  ExternalLink,
  Layers,
} from "lucide-react";

interface LeadStackCarouselProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onStatusChange: (id: string, newStatus: LeadStatus) => Promise<void>;
  onConvert: (id: string) => Promise<void>;
}

export function LeadStackCarousel({
  leads,
  onSelectLead,
}: LeadStackCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const startPos = React.useRef({ x: 0, y: 0 });

  const total = leads.length;

  const nextCard = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (total || 1));
    setDragOffset({ x: 0, y: 0 });
  }, [total]);

  const prevCard = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + (total || 1)) % (total || 1));
    setDragOffset({ x: 0, y: 0 });
  }, [total]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startPos.current.x;
    const dy = touch.clientY - startPos.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset.x < -60 || dragOffset.y < -60) {
      nextCard();
    } else if (dragOffset.x > 60 || dragOffset.y > 60) {
      prevCard();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset.x < -80 || dragOffset.y < -80) {
      nextCard();
    } else if (dragOffset.x > 80 || dragOffset.y > 80) {
      prevCard();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  if (total === 0) {
    return null;
  }

  // Generate the visible slice of 4 cards for the stacked pile
  const visibleCards = [0, 1, 2, 3].map((offset) => {
    const idx = (currentIndex + offset) % total;
    return { lead: leads[idx], offset };
  });

  return (
    <div className="relative flex flex-col items-center justify-center py-6 sm:py-10 select-none overflow-hidden">
      {/* Top Carousel Navigation Pill */}
      <div className="flex items-center justify-between w-full max-w-md px-4 mb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
          Stacked Card Deck • Swipe or Drag
        </span>
        <div className="flex items-center gap-1.5 bg-[var(--muted)]/60 border border-[var(--border)] rounded-full px-2.5 py-0.5 text-xs font-mono text-[var(--foreground)]">
          <span>{currentIndex + 1}</span>
          <span className="opacity-40">/</span>
          <span>{total}</span>
        </div>
      </div>

      {/* The Stacked Card Deck Container */}
      <div
        className="relative w-full max-w-[360px] sm:max-w-[400px] h-[510px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {visibleCards.reverse().map(({ lead, offset }) => {
          const isTop = offset === 0;
          const displayName = lead.business_name || lead.company || lead.full_name;
          const decisionMaker = lead.decision_maker_name
            ? `${lead.decision_maker_name}${lead.decision_maker_title ? ` (${lead.decision_maker_title})` : ""}`
            : null;

          // Compute transform for card stack pile effect
          // Back cards have reduced scale and vertical/horizontal offset
          let transformStyle = "";
          let opacity = 1;
          let zIndex = 10 - offset;

          if (isTop) {
            const rot = dragOffset.x * 0.05;
            transformStyle = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rot}deg)`;
          } else {
            const scale = 1 - offset * 0.05;
            const yOffset = offset * 12;
            const xOffset = offset % 2 === 1 ? offset * 6 : -offset * 6;
            const rot = offset % 2 === 1 ? offset * 1.5 : -offset * 1.5;
            transformStyle = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${scale}) rotate(${rot}deg)`;
            opacity = 1 - offset * 0.18;
          }

          // Dynamic header gradient tint based on score tier
          const gradientClass =
            lead.score >= 70
              ? "from-emerald-500/20 via-teal-500/10 to-transparent"
              : lead.score >= 40
              ? "from-amber-500/20 via-orange-500/10 to-transparent"
              : "from-rose-500/15 via-pink-500/10 to-transparent";

          const cleanPhone = (lead.phone_formatted || lead.phone || "").replace(/[^\d+]/g, "");
          const whatsappHref = cleanPhone
            ? `https://wa.me/${cleanPhone.replace(/\+/g, "")}?text=${encodeURIComponent(
                lead.tailored_pitch || "Hi, I wanted to reach out regarding your website and booking systems."
              )}`
            : null;

          return (
            <div
              key={lead.id + "-" + offset}
              style={{
                transform: transformStyle,
                opacity,
                zIndex,
                transition: isDragging && isTop ? "none" : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s",
              }}
              onClick={() => {
                if (isTop && Math.abs(dragOffset.x) < 5 && Math.abs(dragOffset.y) < 5) {
                  onSelectLead(lead);
                }
              }}
              className="absolute inset-x-0 top-0 h-[490px] rounded-3xl border border-[var(--border)]/80 bg-[var(--card)] shadow-xl overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-2xl"
            >
              {/* Card Header with subtle tint banner & top glyph */}
              <div className={`relative p-5 pb-3 bg-gradient-to-b ${gradientClass} border-b border-[var(--border)]/40`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-amber-400 p-0.5 shadow-md flex items-center justify-center text-white">
                    <Zap className="w-5 h-5 fill-white" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono uppercase bg-[var(--background)]/80 backdrop-blur-xs"
                    >
                      {lead.status}
                    </Badge>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ★ {lead.score}/100
                    </span>
                  </div>
                </div>

                {/* Identity */}
                <h3 className="font-serif font-semibold text-lg text-[var(--foreground)] tracking-tight line-clamp-1">
                  {displayName}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                  {decisionMaker || lead.category || "Commercial Client Prospect"}
                </p>
              </div>

              {/* Card Body & Strategic Overview */}
              <div className="p-5 flex-1 space-y-3.5 overflow-hidden">
                {/* Summary / Consultative Copy Preview */}
                <div className="p-3 rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/30 text-xs text-[var(--foreground)] font-serif italic line-clamp-3 leading-relaxed">
                  &ldquo;{lead.tailored_pitch || "Website mobile performance optimization and automated WhatsApp booking integration pipeline."}&rdquo;
                </div>

                {/* Tactical Weakness & Tech Chips (Matching Image 1 reference) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                    Audit Signals &amp; Tech Chips
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.lighthouse_mobile !== undefined && lead.lighthouse_mobile !== null && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-medium">
                        <Smartphone className="w-3 h-3" />
                        Mobile: {lead.lighthouse_mobile}/100
                      </span>
                    )}

                    {lead.cms_detected && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] text-xs font-mono">
                        <Building2 className="w-3 h-3 opacity-60" />
                        {lead.cms_detected}
                      </span>
                    )}

                    {lead.has_ssl && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                        <ShieldCheck className="w-3 h-3" /> SSL
                      </span>
                    )}

                    {lead.location && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] text-xs">
                        <Tag className="w-2.5 h-2.5" />
                        {lead.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-3 border-t border-[var(--border)]/60 bg-[var(--card)] flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLead(lead);
                  }}
                  className="flex-1 text-xs h-9 font-medium gap-1 rounded-xl cursor-pointer hover:border-[var(--primary)]/40 hover:bg-[var(--accent)]/50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
                  View Intelligence
                </Button>

                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(lead);
                    }}
                    className="h-9 px-3 text-xs rounded-xl"
                  >
                    Details
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls: Previous / Next tactile pill buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          type="button"
          onClick={prevCard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 text-xs text-[var(--foreground)] font-medium active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-[11px] font-mono text-[var(--muted-foreground)]">or drag left/right</span>

        <button
          type="button"
          onClick={nextCard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 text-xs text-[var(--foreground)] font-medium active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
