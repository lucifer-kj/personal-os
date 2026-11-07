"use client";

import * as React from "react";
import {
  PlatformType,
  MediaType,
  PLATFORM_LIMITS,
} from "@/modules/studio/types";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Send,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Share2,
} from "lucide-react";

interface PostPreviewCardProps {
  platform: PlatformType;
  content: string;
  mediaUrls?: string[];
  mediaType?: MediaType;
  authorName?: string;
  authorHandle?: string;
  scheduledAt?: string | null;
}

export function PostPreviewCard({
  platform,
  content,
  mediaUrls = [],
  mediaType = "none",
  authorName = "Workstation Owner",
  authorHandle = "owner",
  scheduledAt,
}: PostPreviewCardProps) {
  const limit = PLATFORM_LIMITS[platform] ?? PLATFORM_LIMITS.generic;
  const isOverLimit = content.length > limit;

  // Render text with styled hashtags and mentions
  const renderFormattedContent = (text: string) => {
    if (!text) {
      return (
        <span className="text-[var(--muted-foreground)] italic">
          Start typing to see simulated preview...
        </span>
      );
    }

    const words = text.split(/(\s+)/);
    return words.map((word, i) => {
      if (word.startsWith("#") && word.length > 1) {
        return (
          <span key={i} className="text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer">
            {word}
          </span>
        );
      }
      if (word.startsWith("@") && word.length > 1) {
        return (
          <span key={i} className="text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer">
            {word}
          </span>
        );
      }
      if (word.startsWith("http://") || word.startsWith("https://")) {
        return (
          <span key={i} className="text-sky-600 dark:text-sky-400 underline cursor-pointer truncate inline-block max-w-[200px] align-bottom">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  const renderMediaGallery = () => {
    if (!mediaUrls || mediaUrls.length === 0) return null;

    if (mediaType === "video" || mediaUrls[0].match(/\.(mp4|mov|webm)$/i)) {
      return (
        <div className="mt-3 rounded-xl overflow-hidden border border-[var(--border)] bg-black/5 dark:bg-black/30">
          <video
            src={mediaUrls[0]}
            controls
            className="w-full max-h-[360px] object-contain rounded-xl"
          />
        </div>
      );
    }

    if (mediaUrls.length === 1) {
      return (
        <div className="mt-3 rounded-xl overflow-hidden border border-[var(--border)] max-h-[360px] bg-[var(--muted)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrls[0]}
            alt="Post preview"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      );
    }

    return (
      <div
        className={`mt-3 grid gap-1.5 rounded-xl overflow-hidden border border-[var(--border)] ${
          mediaUrls.length === 2 ? "grid-cols-2" : "grid-cols-2"
        }`}
      >
        {mediaUrls.slice(0, 4).map((url, idx) => (
          <div key={idx} className="relative aspect-[4/3] bg-[var(--muted)] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Media ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  };

  // 1. X / Twitter Preview
  if (platform === "x") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm text-xs sm:text-sm text-[var(--foreground)]">
        <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-[var(--muted-foreground)] border-b border-[var(--border)] mb-3">
          <span className="flex items-center gap-1.5 font-semibold text-sky-500">
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X Post Preview
          </span>
          {scheduledAt && (
            <span className="text-amber-600 dark:text-amber-400">
              Scheduled: {new Date(scheduledAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs select-none shadow-sm">
            {authorName[0]?.toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-[var(--foreground)] hover:underline truncate">
                  {authorName}
                </span>
                <span className="text-[var(--muted-foreground)]">@{authorHandle}</span>
                <span className="text-[var(--muted-foreground)]">·</span>
                <span className="text-[var(--muted-foreground)]">Now</span>
              </div>
              <MoreHorizontal className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
            </div>

            <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {renderFormattedContent(content)}
            </div>

            {renderMediaGallery()}

            {/* X Action Bar */}
            <div className="mt-4 flex items-center justify-between text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
              <button type="button" className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
                <MessageCircle className="h-4 w-4" />
                <span className="text-[11px]">0</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                <Repeat2 className="h-4 w-4" />
                <span className="text-[11px]">0</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                <Heart className="h-4 w-4" />
                <span className="text-[11px]">0</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
                <Bookmark className="h-4 w-4" />
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
                <Share className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {isOverLimit && (
          <div className="mt-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            Exceeds X limit ({content.length} / 280 characters).
          </div>
        )}
      </div>
    );
  }

  // 2. LinkedIn Preview
  if (platform === "linkedin") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm text-xs sm:text-sm text-[var(--foreground)]">
        <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-[var(--muted-foreground)] border-b border-[var(--border)] mb-3">
          <span className="flex items-center gap-1.5 font-semibold text-blue-600">
            <Share2 className="h-3.5 w-3.5" />
            LinkedIn Post Preview
          </span>
          {scheduledAt && (
            <span className="text-amber-600 dark:text-amber-400">
              Scheduled: {new Date(scheduledAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
            {authorName[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[var(--foreground)]">{authorName}</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">Product Builder &amp; Architect</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">Just now · 🌐</p>
              </div>
              <MoreHorizontal className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {renderFormattedContent(content)}
        </div>

        {renderMediaGallery()}

        {/* LinkedIn Reactions & Bar */}
        <div className="mt-4 pt-2 border-t border-[var(--border)] flex items-center justify-around text-[var(--muted-foreground)]">
          <button type="button" className="flex items-center gap-1.5 hover:text-blue-600 font-medium py-1 px-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <ThumbsUp className="h-4 w-4" />
            <span>Like</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 hover:text-blue-600 font-medium py-1 px-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span>Comment</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 hover:text-blue-600 font-medium py-1 px-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <Repeat2 className="h-4 w-4" />
            <span>Repost</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 hover:text-blue-600 font-medium py-1 px-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>

        {isOverLimit && (
          <div className="mt-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            Exceeds LinkedIn limit ({content.length} / 3,000 characters).
          </div>
        )}
      </div>
    );
  }

  // 3. Threads / Generic Preview
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm text-xs sm:text-sm text-[var(--foreground)]">
      <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-[var(--muted-foreground)] border-b border-[var(--border)] mb-3">
        <span className="flex items-center gap-1.5 font-semibold text-purple-600 dark:text-purple-400">
          <Share2 className="h-3.5 w-3.5" />
          {platform === "threads" ? "Threads Preview" : "Social Draft Preview"}
        </span>
        {scheduledAt && (
          <span className="text-amber-600 dark:text-amber-400">
            Scheduled: {new Date(scheduledAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-xs select-none shadow-sm">
          {authorName[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--foreground)] truncate">@{authorHandle}</span>
            <span className="text-[11px] text-[var(--muted-foreground)]">Now</span>
          </div>

          <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {renderFormattedContent(content)}
          </div>

          {renderMediaGallery()}

          <div className="mt-4 flex items-center gap-4 text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
            <Heart className="h-4 w-4 hover:text-rose-500 cursor-pointer" />
            <MessageCircle className="h-4 w-4 hover:text-purple-500 cursor-pointer" />
            <Repeat2 className="h-4 w-4 hover:text-emerald-500 cursor-pointer" />
            <Send className="h-4 w-4 hover:text-sky-500 cursor-pointer" />
          </div>
        </div>
      </div>

      {isOverLimit && (
        <div className="mt-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          Exceeds limit ({content.length} / {limit} characters).
        </div>
      )}
    </div>
  );
}
