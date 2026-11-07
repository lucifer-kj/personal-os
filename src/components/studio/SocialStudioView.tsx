"use client";

import * as React from "react";
import {
  SocialPost,
  PlatformType,
  PostStatus,
  PLATFORM_LIMITS,
} from "@/modules/studio/types";
import { PostPreviewCard } from "./PostPreviewCard";
import { useSpeechToText } from "@/lib/hooks/useSpeechToText";
import {
  Share2,
  Plus,
  Search,
  Calendar,
  Image as ImageIcon,
  Video,
  Mic,
  MicOff,
  Trash2,
  Check,
  Clock,
  Sparkles,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";

interface SocialStudioViewProps {
  initialPosts?: SocialPost[];
}

export function SocialStudioView({ initialPosts = [] }: SocialStudioViewProps) {
  const [posts, setPosts] = React.useState<SocialPost[]>(initialPosts);
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(
    initialPosts.length > 0 ? initialPosts[0].id : null
  );

  // Filter state
  const [statusFilter, setStatusFilter] = React.useState<PostStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = React.useState<PlatformType | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Editor state
  const [editorTitle, setEditorTitle] = React.useState("");
  const [editorContent, setEditorContent] = React.useState("");
  const [editorPlatform, setEditorPlatform] = React.useState<PlatformType>("x");
  const [editorStatus, setEditorStatus] = React.useState<PostStatus>("draft");
  const [editorMediaUrls, setEditorMediaUrls] = React.useState<string[]>([]);
  const [editorScheduledAt, setEditorScheduledAt] = React.useState<string>("");
  const [editorTags, setEditorTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");

  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // STT Hook
  const {
    isListening,
    transcript,
    isSupported: isSttSupported,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechToText();

  // When speech transcript updates, append to editor content
  React.useEffect(() => {
    if (transcript) {
      setEditorContent((prev) => {
        const spacer = prev && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "";
        return `${prev}${spacer}${transcript}`;
      });
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  // Sync editor when selected post changes
  React.useEffect(() => {
    if (!selectedPostId) {
      resetEditor();
      return;
    }
    const current = posts.find((p) => p.id === selectedPostId);
    if (current) {
      setEditorTitle(current.title || "");
      setEditorContent(current.content || "");
      setEditorPlatform(current.platform || "x");
      setEditorStatus(current.status || "draft");
      setEditorMediaUrls(current.media_urls || []);
      setEditorScheduledAt(
        current.scheduled_at ? current.scheduled_at.slice(0, 16) : ""
      );
      setEditorTags(current.tags || []);
      setErrorMsg(null);
    }
  }, [selectedPostId, posts]);

  const resetEditor = () => {
    setSelectedPostId(null);
    setEditorTitle("");
    setEditorContent("");
    setEditorPlatform("x");
    setEditorStatus("draft");
    setEditorMediaUrls([]);
    setEditorScheduledAt("");
    setEditorTags([]);
    setErrorMsg(null);
  };

  const handleCreateNew = () => {
    resetEditor();
  };

  // Character limit calculations
  const charLimit = PLATFORM_LIMITS[editorPlatform] ?? PLATFORM_LIMITS.generic;
  const charsUsed = editorContent.length;
  const charsRemaining = charLimit - charsUsed;
  const isOverLimit = charsRemaining < 0;
  const percentUsed = Math.min(100, Math.round((charsUsed / charLimit) * 100));

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/v1/studio/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || "File upload failed");
        }

        const json = await res.json();
        uploadedUrls.push(json.data.url);
      }

      setEditorMediaUrls((prev) => [...prev, ...uploadedUrls]);
      setSuccessMsg(`Uploaded ${uploadedUrls.length} file(s)`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Media upload failed";
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = (urlToRemove: string) => {
    setEditorMediaUrls((prev) => prev.filter((u) => u !== urlToRemove));
  };

  // Tag Management
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, "");
      if (clean && !editorTags.includes(clean)) {
        setEditorTags((prev) => [...prev, clean]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditorTags((prev) => prev.filter((t) => t !== tag));
  };

  // Save Post Handler
  const handleSavePost = async (overrideStatus?: PostStatus) => {
    if (!editorContent.trim()) {
      setErrorMsg("Post content cannot be empty.");
      return;
    }

    if (isOverLimit) {
      setErrorMsg(`Post content exceeds ${editorPlatform.toUpperCase()} limit (${charsUsed}/${charLimit}).`);
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const statusToSave = overrideStatus || editorStatus;
    const scheduledAtPayload =
      editorScheduledAt && statusToSave === "scheduled"
        ? new Date(editorScheduledAt).toISOString()
        : null;

    const payload = {
      title: editorTitle.trim() || undefined,
      content: editorContent.trim(),
      platform: editorPlatform,
      status: statusToSave,
      media_urls: editorMediaUrls,
      scheduled_at: scheduledAtPayload,
      tags: editorTags,
    };

    try {
      if (selectedPostId) {
        // Update existing
        const res = await fetch(`/api/v1/studio/posts/${selectedPostId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || "Failed to update post");
        }

        const json = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === selectedPostId ? json.data : p))
        );
        setSuccessMsg("Post updated successfully");
      } else {
        // Create new
        const res = await fetch("/api/v1/studio/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || "Failed to create post");
        }

        const json = await res.json();
        setPosts((prev) => [json.data, ...prev]);
        setSelectedPostId(json.data.id);
        setSuccessMsg("Draft created successfully");
      }
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving post";
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Post Handler
  const handleDeletePost = async () => {
    if (!selectedPostId) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/v1/studio/posts/${selectedPostId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");

      setPosts((prev) => prev.filter((p) => p.id !== selectedPostId));
      resetEditor();
      setSuccessMsg("Post deleted");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting post";
      setErrorMsg(msg);
    }
  };

  // Filtered post list
  const filteredPosts = posts.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (platformFilter !== "all" && p.platform !== platformFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchContent = p.content.toLowerCase().includes(q);
      const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[1600px] mx-auto p-4 sm:p-6 gap-4">
      {/* Studio Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
            <Share2 className="h-6 w-6 text-indigo-500" />
            Social Studio
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            Draft, preview, schedule, and attach media assets for X, Threads, and LinkedIn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Post Library (3 cols) */}
        <div className="lg:col-span-3 flex flex-col border border-[var(--border)] rounded-2xl bg-[var(--card)] overflow-hidden shadow-xs">
          <div className="p-3 border-b border-[var(--border)] space-y-2.5 bg-[var(--muted)]/30">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search drafts &amp; posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-1 scrollbar-none">
              {(["all", "draft", "scheduled", "published"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded-full capitalize font-medium transition-colors ${
                    statusFilter === st
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] scrollbar-none">
              {(["all", "x", "linkedin", "threads"] as const).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPlatformFilter(plat)}
                  className={`px-2 py-0.5 rounded-md uppercase font-mono text-[10px] transition-colors ${
                    platformFilter === plat
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-[var(--border)]/30">
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
                No posts found.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isSelected = post.id === selectedPostId;
                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[var(--muted)] shadow-xs border border-[var(--border)]"
                        : "hover:bg-[var(--muted)]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                        {post.platform}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded capitalize ${
                          post.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : post.status === "scheduled"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-slate-500/10 text-[var(--muted-foreground)]"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <p className="font-medium text-xs text-[var(--foreground)] truncate">
                      {post.title || post.content.slice(0, 30)}
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 mt-0.5">
                      {post.content}
                    </p>
                    {post.media_urls.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-500">
                        {post.media_type === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                        <span>{post.media_urls.length} media asset(s)</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Workbench & Composer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col border border-[var(--border)] rounded-2xl bg-[var(--card)] p-4 overflow-y-auto space-y-4 shadow-xs">
          {/* Platform Switcher & Character Meter */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-1.5">
              {(["x", "linkedin", "threads", "generic"] as const).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setEditorPlatform(plat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg uppercase font-mono transition-all ${
                    editorPlatform === plat
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            {/* Character meter */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-medium ${
                  isOverLimit
                    ? "text-rose-600 dark:text-rose-400 font-bold"
                    : charsRemaining < 30
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {charsUsed} / {charLimit}
              </span>
              <div className="w-12 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isOverLimit ? "bg-rose-500" : percentUsed > 85 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase">
              Internal Title / Campaign
            </label>
            <input
              type="text"
              placeholder="e.g. Personal OS Launch Drop #1"
              value={editorTitle}
              onChange={(e) => setEditorTitle(e.target.value)}
              className="mt-1 w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Post Content Area with Voice Dictation */}
          <div className="flex-1 flex flex-col min-h-[180px]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase">
                Content
              </label>
              {isSttSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full transition-colors ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3 w-3" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="h-3 w-3 text-indigo-500" />
                      Dictate
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              rows={8}
              placeholder="Draft your post here. Use #hashtags and @mentions as needed..."
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="w-full flex-1 p-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none leading-relaxed"
            />
          </div>

          {/* Media Attachments Dropzone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
                Media Assets (Images / Videos)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                {isUploading ? "Uploading..." : "Add Media"}
              </button>
            </div>

            {/* Thumbnail preview list */}
            {editorMediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30">
                {editorMediaUrls.map((url, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--card)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(url)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduling & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
            <div>
              <label className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                Schedule Publish
              </label>
              <input
                type="datetime-local"
                value={editorScheduledAt}
                onChange={(e) => {
                  setEditorScheduledAt(e.target.value);
                  if (e.target.value) setEditorStatus("scheduled");
                }}
                className="mt-1 w-full px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase">
                Tags
              </label>
              <input
                type="text"
                placeholder="Type tag &amp; hit Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="mt-1 w-full px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              {editorTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {editorTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]"
                    >
                      #{t}
                      <button type="button" onClick={() => handleRemoveTag(t)}>
                        <X className="h-2.5 w-2.5 text-[var(--muted-foreground)] hover:text-rose-500" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
              {successMsg}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-[var(--border)]">
            {selectedPostId && (
              <button
                type="button"
                onClick={handleDeletePost}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSavePost("draft")}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors"
              >
                Save Draft
              </button>

              {editorScheduledAt ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSavePost("scheduled")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                >
                  Schedule Post
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSavePost("published")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark Published
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulated Preview (4 cols) */}
        <div className="lg:col-span-4 flex flex-col border border-[var(--border)] rounded-2xl bg-[var(--card)] p-4 overflow-y-auto space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <span className="text-xs font-mono uppercase font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Simulated Preview
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--foreground)] uppercase">
              {editorPlatform}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-start">
            <PostPreviewCard
              platform={editorPlatform}
              content={editorContent}
              mediaUrls={editorMediaUrls}
              scheduledAt={editorScheduledAt || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
