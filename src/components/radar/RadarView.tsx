"use client";

import * as React from "react";
import { RSSFeed, RadarItem } from "@/modules/radar/types";
import {
  Radio,
  Plus,
  RefreshCw,
  Search,
  Star,
  Check,
  ExternalLink,
  BookOpen,
  Share2,
  Trash2,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { fireCelebrationConfetti } from "@/lib/ui/confetti";
import { useRouter } from "next/navigation";

interface RadarViewProps {
  initialFeeds?: RSSFeed[];
  initialItems?: RadarItem[];
}

export function RadarView({
  initialFeeds = [],
  initialItems = [],
}: RadarViewProps) {
  const router = useRouter();
  const [feeds, setFeeds] = React.useState<RSSFeed[]>(initialFeeds);
  const [items, setItems] = React.useState<RadarItem[]>(initialItems);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    initialItems.length > 0 ? initialItems[0].id : null
  );

  // Filters
  const [activeFilter, setActiveFilter] = React.useState<"all" | "unread" | "starred">("all");
  const [selectedFeedId, setSelectedFeedId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals & States
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newFeedUrl, setNewFeedUrl] = React.useState("");
  const [newFeedCategory, setNewFeedCategory] = React.useState("Tech");
  const [isSubscribing, setIsSubscribing] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [personalNotes, setPersonalNotes] = React.useState("");
  const [isPromoting, setIsPromoting] = React.useState(false);

  const selectedItem = items.find((i) => i.id === selectedItemId) || null;

  // Add Feed Handler
  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl.trim()) return;

    setIsSubscribing(true);
    try {
      const res = await fetch("/api/v1/radar/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newFeedUrl.trim(),
          category: newFeedCategory.trim() || "General",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to subscribe to feed");
      }

      const json = await res.json();
      setFeeds((prev) => [json.data, ...prev]);
      setIsAddModalOpen(false);
      setNewFeedUrl("");
      toast.success(`Subscribed to "${json.data.title}"`);

      // Refresh items list
      await handleSync(json.data.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Subscription error";
      toast.error(msg);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Sync Feeds Handler
  const handleSync = async (feedId?: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/v1/radar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed_id: feedId }),
      });

      if (!res.ok) throw new Error("Sync failed");
      const json = await res.json();

      // Refresh items from API
      const itemsRes = await fetch("/api/v1/radar/items");
      if (itemsRes.ok) {
        const itemsJson = await itemsRes.json();
        setItems(itemsJson.data);
      }

      toast.success(`Radar refreshed (+${json.data.itemsAdded} new signals)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      toast.error(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Mark Read / Unread Handler
  const handleToggleRead = async (item: RadarItem) => {
    const nextRead = !item.is_read;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_read: nextRead } : i))
    );

    try {
      await fetch(`/api/v1/radar/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: nextRead }),
      });
    } catch {
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_read: item.is_read } : i))
      );
    }
  };

  // Star / Unstar Handler
  const handleToggleStar = async (item: RadarItem) => {
    const nextStar = !item.is_starred;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_starred: nextStar } : i))
    );

    try {
      await fetch(`/api/v1/radar/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_starred: nextStar }),
      });
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_starred: item.is_starred } : i))
      );
    }
  };

  // Promote Item to Note
  const handlePromoteToNote = async () => {
    if (!selectedItem) return;
    setIsPromoting(true);

    try {
      const res = await fetch(`/api/v1/radar/items/${selectedItem.id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "note",
          notes: personalNotes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to promote to note");
      const json = await res.json();

      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? { ...i, is_read: true, promoted_to_note_id: json.data.id }
            : i
        )
      );
      setPersonalNotes("");
      fireCelebrationConfetti();
      toast.success("Synthesized into Notes knowledge base!", {
        action: {
          label: "View Note",
          onClick: () => router.push("/notes"),
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Promotion failed";
      toast.error(msg);
    } finally {
      setIsPromoting(false);
    }
  };

  // Promote Item to Social Post
  const handlePromoteToSocialPost = async () => {
    if (!selectedItem) return;
    setIsPromoting(true);

    try {
      const res = await fetch(`/api/v1/radar/items/${selectedItem.id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "post" }),
      });

      if (!res.ok) throw new Error("Failed to promote to social draft");
      const json = await res.json();

      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? { ...i, is_read: true, promoted_to_post_id: json.data.id }
            : i
        )
      );
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

  // Delete Feed Handler
  const handleDeleteFeed = async (feedId: string, feedTitle: string) => {
    if (!confirm(`Unsubscribe from "${feedTitle}"?`)) return;

    try {
      const res = await fetch(`/api/v1/radar/feeds/${feedId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete feed");

      setFeeds((prev) => prev.filter((f) => f.id !== feedId));
      setItems((prev) => prev.filter((i) => i.feed_id !== feedId));
      if (selectedFeedId === feedId) setSelectedFeedId(null);
      toast.success(`Unsubscribed from ${feedTitle}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error(msg);
    }
  };

  // Filter Items
  const filteredItems = items.filter((item) => {
    if (selectedFeedId && item.feed_id !== selectedFeedId) return false;
    if (activeFilter === "unread" && item.is_read) return false;
    if (activeFilter === "starred" && !item.is_starred) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary?.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[1600px] mx-auto p-4 sm:p-6 gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
            <Radio className="h-6 w-6 text-rose-500 animate-pulse" />
            The Radar
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            Curated high-signal RSS &amp; Atom feeds. 1-click promote to Notes or Social Studio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => handleSync()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-500 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Feeds"}
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Feed
          </button>
        </div>
      </div>

      {/* Main 3-Column Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Feeds & Channels (3 cols) */}
        <div className="lg:col-span-3 flex flex-col border border-[var(--border)] rounded-2xl bg-[var(--card)] overflow-hidden shadow-xs">
          <div className="p-3 border-b border-[var(--border)] space-y-2 bg-[var(--muted)]/30">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
              Signal Channels
            </span>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1">
              {(["all", "unread", "starred"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`flex-1 py-1 text-center rounded-lg text-xs capitalize font-medium transition-colors ${
                    activeFilter === tab
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Feeds List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              type="button"
              onClick={() => setSelectedFeedId(null)}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-all ${
                selectedFeedId === null
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xs"
                  : "text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" />
                <span>All Feeds</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10">
                {items.length}
              </span>
            </button>

            {feeds.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                No feeds subscribed yet. Click &ldquo;Add Feed&rdquo; to begin tracking signal.
              </div>
            ) : (
              feeds.map((feed) => {
                const isSelected = selectedFeedId === feed.id;
                const unreadCount = items.filter(
                  (i) => i.feed_id === feed.id && !i.is_read
                ).length;

                return (
                  <div
                    key={feed.id}
                    className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[var(--muted)] border border-[var(--border)] font-semibold"
                        : "hover:bg-[var(--muted)]/60 text-[var(--foreground)]"
                    }`}
                    onClick={() => setSelectedFeedId(feed.id)}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate">{feed.title}</p>
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                        #{feed.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                          {unreadCount}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFeed(feed.id, feed.title);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-rose-500 transition-opacity"
                        title="Unsubscribe"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Signal Stream (4 cols) */}
        <div className="lg:col-span-4 flex flex-col border border-[var(--border)] rounded-2xl bg-[var(--card)] overflow-hidden shadow-xs">
          {/* Search Bar */}
          <div className="p-3 border-b border-[var(--border)] bg-[var(--muted)]/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search incoming articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          {/* Stream Cards */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-[var(--border)]/30">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
                No signal found matching criteria.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      if (!item.is_read) handleToggleRead(item);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[var(--muted)] border border-[var(--border)] shadow-2xs"
                        : "hover:bg-[var(--muted)]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-[var(--primary)] font-semibold truncate">
                        {item.feed?.title || "Radar Signal"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.promoted_to_note_id && (
                          <span title="Promoted to Note" className="text-emerald-500">
                            <BookOpen className="h-3 w-3" />
                          </span>
                        )}
                        {item.promoted_to_post_id && (
                          <span title="Promoted to Social Draft" className="text-indigo-500">
                            <Share2 className="h-3 w-3" />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(item);
                          }}
                          className={`p-0.5 rounded transition-colors ${
                            item.is_starred
                              ? "text-amber-500 fill-current"
                              : "text-[var(--muted-foreground)] hover:text-amber-500"
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${item.is_starred ? "fill-amber-500" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <h3
                      className={`text-xs font-semibold leading-snug line-clamp-2 ${
                        item.is_read ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 mt-1 leading-relaxed">
                        {item.summary}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--muted-foreground)]">
                      <span>{new Date(item.published_at).toLocaleDateString()}</span>
                      {!item.is_read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Signal Reader & Promotion Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col border border-[var(--border)] rounded-2xl bg-[var(--card)] p-5 overflow-y-auto space-y-4 shadow-xs">
          {selectedItem ? (
            <>
              {/* Header */}
              <div className="space-y-2 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                    {selectedItem.feed?.category || "Article"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(selectedItem)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
                        selectedItem.is_read
                          ? "border-[var(--border)] text-[var(--muted-foreground)]"
                          : "border-emerald-500 text-emerald-600 bg-emerald-500/10 font-medium"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      {selectedItem.is_read ? "Mark Unread" : "Mark as Read"}
                    </button>

                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                    >
                      <span>Original</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-serif font-bold text-[var(--foreground)] leading-snug">
                  {selectedItem.title}
                </h2>

                <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--muted-foreground)]">
                  {selectedItem.author && <span>By {selectedItem.author}</span>}
                  <span>•</span>
                  <span>{new Date(selectedItem.published_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed space-y-3 font-sans">
                {selectedItem.content || selectedItem.summary ? (
                  <p className="whitespace-pre-wrap">{selectedItem.content || selectedItem.summary}</p>
                ) : (
                  <p className="text-[var(--muted-foreground)] italic">
                    Click &ldquo;Original&rdquo; to read the full source article.
                  </p>
                )}
              </div>

              {/* 1-Click Knowledge & Social Promotion Action Deck */}
              <div className="mt-auto pt-4 border-t border-[var(--border)] space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  Signal Synthesis &amp; Broadcast
                </span>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Optional: Add personal takeaways or synthesis before promoting..."
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isPromoting}
                      onClick={handlePromoteToNote}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Promote to Note
                    </button>

                    <button
                      type="button"
                      disabled={isPromoting}
                      onClick={handlePromoteToSocialPost}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Draft Social Post
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[var(--muted-foreground)]">
              <Radio className="h-8 w-8 mb-2 opacity-40 text-rose-500" />
              <p className="text-xs">Select an incoming signal to read and promote.</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscribe to Feed Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase font-mono">
                  Subscribe to Signal
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddFeed} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase">
                  RSS / Atom Feed URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://news.ycombinator.com/rss"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI, Tech, Design, Economics"
                  value={newFeedCategory}
                  onChange={(e) => setNewFeedCategory(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                >
                  {isSubscribing ? "Validating & Subscribing..." : "Subscribe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
