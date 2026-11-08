"use client";

import * as React from "react";
import { RadarItem } from "@/modules/radar/types";
import { Button } from "@/components/ui/button";
import {
  X,
  ExternalLink,
  Check,
  BookOpen,
  Share2,
  Sparkles,
  Calendar,
  Loader2,
} from "lucide-react";

interface RadarArticleSheetProps {
  item: RadarItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead: (item: RadarItem) => void;
  onPromoteToNote: (item: RadarItem, notes: string) => Promise<void>;
  onPromoteToPost: (item: RadarItem, notes: string) => Promise<void>;
  isPromotingNote: boolean;
  isPromotingPost: boolean;
}

export function RadarArticleSheet({
  item,
  isOpen,
  onClose,
  onToggleRead,
  onPromoteToNote,
  onPromoteToPost,
  isPromotingNote,
  isPromotingPost,
}: RadarArticleSheetProps) {
  const [personalNotes, setPersonalNotes] = React.useState("");

  React.useEffect(() => {
    setPersonalNotes("");
  }, [item?.id]);

  if (!isOpen || !item) return null;

  // Simple HTML stripper for clean reading
  const cleanBodyText = (text?: string | null) => {
    if (!text) return "";
    return text
      .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const displayText = cleanBodyText(item.content) || cleanBodyText(item.summary) || item.title;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Window Sheet */}
      <div className="relative z-10 w-full h-[90vh] rounded-t-3xl bg-[#161413] border-t border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-neutral-600/70" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase">
              {item.feed?.category || "Article"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleRead(item)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  item.is_read
                    ? "border-white/10 text-neutral-400"
                    : "border-emerald-500/50 text-emerald-400 bg-emerald-500/10 font-medium"
                }`}
              >
                <Check className="h-3 w-3" />
                <span>{item.is_read ? "Unread" : "Mark Read"}</span>
              </button>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#E05B27] text-white hover:opacity-90"
              >
                <span>Original</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
                aria-label="Close article preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-serif font-bold text-white leading-snug">
            {item.title}
          </h2>

          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
            {item.author && <span>By {item.author}</span>}
            <span>•</span>
            <span>{new Date(item.published_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Scrollable Reader Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-neutral-200 text-sm leading-relaxed font-sans">
          <p className="whitespace-pre-line">{displayText}</p>
        </div>

        {/* Promotion Action Deck Footer */}
        <div className="p-4 border-t border-white/10 bg-[#12100E] shrink-0 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-neutral-400 font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Promote to Knowledge Base</span>
          </div>

          <textarea
            rows={2}
            placeholder="Add personal takeaway before promoting..."
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-white/10 bg-black/30 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#E05B27]"
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              onClick={() => onPromoteToNote(item, personalNotes)}
              disabled={isPromotingNote}
              className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
            >
              {isPromotingNote ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <BookOpen className="h-3.5 w-3.5" />
              )}
              <span>Promote to Note</span>
            </Button>

            <Button
              size="sm"
              onClick={() => onPromoteToPost(item, personalNotes)}
              disabled={isPromotingPost}
              className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
            >
              {isPromotingPost ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              <span>Draft Social Post</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
