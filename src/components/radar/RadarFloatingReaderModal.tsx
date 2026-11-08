"use client";

import * as React from "react";
import {
  X,
  ExternalLink,
  BookOpen,
  Share2,
  Check,
  Star,
  MessageSquare,
  Clock,
  Sparkles,
  Radio,
  FileText,
  User,
  ArrowUpRight,
} from "lucide-react";
import { RadarItem } from "@/modules/radar/types";
import { toast } from "sonner";
import { fireCelebrationConfetti } from "@/lib/ui/confetti";
import { useRouter } from "next/navigation";

interface CleanArticleData {
  title: string;
  byline?: string;
  siteName: string;
  content: string;
  excerpt?: string;
  wordCount: number;
  readingTimeMinutes: number;
  discussionUrl?: string;
  commentsCount?: number;
  comments?: Array<{ author: string; text: string; time: string }>;
  url: string;
}

interface RadarFloatingReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RadarItem | null;
  onToggleRead: (item: RadarItem) => void;
  onToggleStar: (item: RadarItem) => void;
}

export function RadarFloatingReaderModal({
  isOpen,
  onClose,
  item,
  onToggleRead,
  onToggleStar,
}: RadarFloatingReaderModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [articleData, setArticleData] = React.useState<CleanArticleData | null>(null);
  const [personalNotes, setPersonalNotes] = React.useState("");
  const [isPromoting, setIsPromoting] = React.useState(false);

  // Fetch real-time article contents with skeleton
  React.useEffect(() => {
    if (!isOpen || !item) return;

    let isMounted = true;
    setIsLoading(true);
    setArticleData(null);

    const fetchRealtime = async () => {
      try {
        const query = new URLSearchParams({
          url: item.url,
          title: item.title,
        });
        const res = await fetch(`/api/v1/radar/fetch-article?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch article preview");
        const json = await res.json();
        if (isMounted) {
          setArticleData(json.data);
        }
      } catch {
        if (isMounted) {
          // Graceful fallback to existing RSS snippet
          setArticleData({
            title: item.title,
            siteName: item.feed?.title || "Radar Stream",
            content: item.content || item.summary || "No preview content available.",
            wordCount: 150,
            readingTimeMinutes: 1,
            url: item.url,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRealtime();

    return () => {
      isMounted = false;
    };
  }, [isOpen, item]);

  // Handle ESC key to dismiss
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handlePromoteToNote = async () => {
    setIsPromoting(true);
    try {
      const res = await fetch(`/api/v1/radar/items/${item.id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "note",
          personal_notes: personalNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to promote to note");
      const json = await res.json();

      fireCelebrationConfetti();
      toast.success("Article converted to Knowledge Note!", {
        action: {
          label: "Open Note",
          onClick: () => router.push(`/notes?id=${json.data.id}`),
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Promotion failed";
      toast.error(msg);
    } finally {
      setIsPromoting(false);
    }
  };

  const handlePromoteToSocialPost = async () => {
    setIsPromoting(true);
    try {
      const res = await fetch(`/api/v1/radar/items/${item.id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "post",
          personal_notes: personalNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to promote to social draft");
      fireCelebrationConfetti();
      toast.success("Draft created in Social Studio!", {
        action: {
          label: "View in Studio",
          onClick: () => router.push("/studio"),
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Draft creation failed";
      toast.error(msg);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Floating Big Readable Box with Margins */}
      <div className="w-full max-w-6xl h-[92vh] rounded-3xl border border-white/10 bg-[#161311] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col lg:flex-row overflow-hidden text-[#EDE7DE]">
        
        {/* Left Side: Big Readable Box (Aligned Left, ~70% Width) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
          {/* Top Bar on Left Panel */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#E05B27]/20 text-[#E05B27] border border-[#E05B27]/30">
                {item.feed?.category || "Radar Signal"}
              </span>
              <span className="text-xs font-mono text-[#A69E94] truncate">
                {articleData?.siteName || item.feed?.title || "Live Stream"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {articleData?.readingTimeMinutes && (
                <span className="text-xs font-mono text-[#A69E94] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {articleData.readingTimeMinutes} min read
                </span>
              )}
              {/* Mobile-only close button */}
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-[#A69E94] hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Article Reading Surface */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-12 space-y-6 max-w-3xl font-serif text-base sm:text-lg leading-relaxed text-[#EDE7DE] selection:bg-[#E05B27]/30 selection:text-white">
            {isLoading ? (
              /* Apple-Grade Shimmering Skeleton Loader */
              <div className="space-y-6 animate-pulse" aria-label="Loading article content">
                {/* Title Skeleton */}
                <div className="space-y-2">
                  <div className="h-8 sm:h-10 w-4/5 rounded-xl bg-white/10" />
                  <div className="h-8 sm:h-10 w-3/5 rounded-xl bg-white/10" />
                </div>

                {/* Byline Skeleton */}
                <div className="h-4 w-48 rounded-lg bg-white/5 pt-1" />

                {/* Paragraph Skeletons */}
                <div className="space-y-3 pt-4">
                  <div className="h-4 w-full rounded bg-white/5" />
                  <div className="h-4 w-11/12 rounded bg-white/5" />
                  <div className="h-4 w-full rounded bg-white/5" />
                  <div className="h-4 w-4/5 rounded bg-white/5" />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="h-4 w-full rounded bg-white/5" />
                  <div className="h-4 w-5/6 rounded bg-white/5" />
                  <div className="h-4 w-full rounded bg-white/5" />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="h-4 w-11/12 rounded bg-white/5" />
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                </div>
              </div>
            ) : (
              /* Real Extracted Article Content */
              <article className="space-y-6">
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                  {articleData?.title || item.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#A69E94] pb-4 border-b border-white/10">
                  {articleData?.byline && <span>{articleData.byline}</span>}
                  <span>•</span>
                  <span>{new Date(item.published_at).toLocaleDateString()}</span>
                  {articleData?.wordCount ? (
                    <>
                      <span>•</span>
                      <span>{articleData.wordCount} words</span>
                    </>
                  ) : null}
                </div>

                {/* Article Paragraphs */}
                <div className="space-y-5 text-[#E3DED8] leading-[1.8] font-serif">
                  {(articleData?.content || item.content || item.summary || "")
                    .split(/\n\s*\n/)
                    .map((paragraph, pIdx) => (
                      <p key={pIdx} className="whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </article>
            )}
          </div>
        </div>

        {/* Right Side: Small Right Panel for Comments, Notes & Broadcast (~30% Width) */}
        <div className="w-full lg:w-84 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/40 p-5 flex flex-col justify-between space-y-4 overflow-y-auto">
          {/* Top Controls: Dismiss & Quick Actions */}
          <div className="space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#E05B27]" />
                Signal Intelligence
              </span>
              <button
                type="button"
                onClick={onClose}
                className="hidden lg:flex p-1.5 rounded-lg text-[#A69E94] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onToggleRead(item)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  item.is_read
                    ? "border-white/10 text-[#A69E94] hover:text-white"
                    : "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 font-semibold"
                }`}
              >
                <Check className="h-3 w-3" />
                {item.is_read ? "Mark Unread" : "Mark Read"}
              </button>

              <button
                type="button"
                onClick={() => onToggleStar(item)}
                className={`p-2 rounded-lg border transition-colors ${
                  item.is_starred
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                    : "border-white/10 text-[#A69E94] hover:text-amber-400"
                }`}
                title="Star signal"
              >
                <Star className={`h-3.5 w-3.5 ${item.is_starred ? "fill-amber-400" : ""}`} />
              </button>

              <a
                href={articleData?.url || item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Open original website"
              >
                <span>Original</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Middle: Comments & Discussion Preview */}
          <div className="flex-1 space-y-3 min-h-0 overflow-y-auto">
            {/* Discussion Thread Box */}
            <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                  Community Discussion
                </span>
                {articleData?.commentsCount !== undefined && (
                  <span className="text-[10px] font-mono text-[#A69E94]">
                    {articleData.commentsCount} comments
                  </span>
                )}
              </div>

              {articleData?.comments && articleData.comments.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {articleData.comments.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[#A69E94] font-mono text-[10px]">
                        <span>@{c.author}</span>
                        <span>{c.time}</span>
                      </div>
                      <p className="text-white/80 line-clamp-3 leading-relaxed font-sans">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A69E94] leading-relaxed">
                  Direct discussion and commentary thread available on source platform.
                </p>
              )}

              {articleData?.discussionUrl && (
                <a
                  href={articleData.discussionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline font-mono"
                >
                  Open Full Thread Discussion <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>

            {/* Personal Synthesis & Notes Area */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#A69E94] font-semibold">
                Personal Takeaways
              </span>
              <textarea
                rows={3}
                placeholder="Add personal notes or synthesis before promoting..."
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-[#6E675F] focus:outline-none focus:ring-1 focus:ring-[#E05B27] resize-none"
              />
            </div>
          </div>

          {/* Bottom: 1-Click Promote Actions */}
          <div className="pt-3 border-t border-white/10 space-y-2 shrink-0">
            <button
              type="button"
              disabled={isPromoting}
              onClick={handlePromoteToNote}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <BookOpen className="h-4 w-4" />
              Promote to Knowledge Note
            </button>

            <button
              type="button"
              disabled={isPromoting}
              onClick={handlePromoteToSocialPost}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Share2 className="h-4 w-4" />
              Draft in Social Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
