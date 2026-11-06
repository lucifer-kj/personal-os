"use client";

import * as React from "react";
import { InboxItem, ConvertedEntityType, CaptureType } from "@/modules/inbox/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle2,
  Bookmark,
  Link as LinkIcon,
  Calendar,
  Check,
  Trash2,
  ExternalLink,
  Archive,
} from "lucide-react";

interface InboxListProps {
  initialItems: InboxItem[];
  onTriageItem?: (itemId: string, targetType: ConvertedEntityType) => void;
  onDismissItem?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
}

export function InboxList({
  initialItems,
  onTriageItem,
  onDismissItem,
  onDeleteItem,
}: InboxListProps) {
  const [items, setItems] = React.useState<InboxItem[]>(initialItems);
  const [prevInitial, setPrevInitial] = React.useState(initialItems);
  if (initialItems !== prevInitial) {
    setPrevInitial(initialItems);
    setItems(initialItems);
  }

  const [activeTab, setActiveTab] = React.useState<"unprocessed" | "processed" | "all">("unprocessed");
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const filteredItems = React.useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter((i) => i.status === activeTab);
  }, [items, activeTab]);

  const handleTriageToTask = async (item: InboxItem) => {
    setProcessingId(item.id);
    try {
      const res = await fetch(`/api/v1/inbox/${item.id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: "task",
          priority: "medium",
        }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "processed",
                  converted_entity_type: "task",
                  processed_at: new Date().toISOString(),
                }
              : i
          )
        );
        onTriageItem?.(item.id, "task");
      }
    } catch (err) {
      console.error("Failed to convert item to task:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (item: InboxItem) => {
    try {
      const res = await fetch(`/api/v1/inbox/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "dismissed" } : i))
        );
        onDismissItem?.(item.id);
      }
    } catch (err) {
      console.error("Failed to dismiss item:", err);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/inbox/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        onDeleteItem?.(itemId);
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const getTypeIcon = (type: CaptureType) => {
    switch (type) {
      case "task":
        return <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />;
      case "note":
        return <Bookmark className="h-3.5 w-3.5 text-amber-500" />;
      case "link":
        return <LinkIcon className="h-3.5 w-3.5 text-cyan-500" />;
      case "reminder":
        return <Calendar className="h-3.5 w-3.5 text-emerald-500" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab filter bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("unprocessed")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === "unprocessed"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Unprocessed ({items.filter((i) => i.status === "unprocessed").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("processed")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === "processed"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Processed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === "all"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            All Captures
          </button>
        </div>

        <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-[var(--border)] bg-[var(--card)]/50 space-y-3">
          <div className="flex justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600/80" />
          </div>
          <h3 className="text-sm font-medium text-[var(--foreground)]">Inbox Zero</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto font-serif italic">
            Everything captured has been triaged into tasks, notes, or dismissed.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`p-4 transition-all border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.status === "processed" ? "opacity-75" : ""
              }`}
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.capture_type)}
                  <h4 className="text-sm font-medium text-[var(--foreground)] truncate">
                    {item.title}
                  </h4>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono px-2 py-0.5">
                    {item.capture_type}
                  </Badge>
                  {item.status === "processed" && (
                    <Badge variant="default" className="text-[10px] uppercase font-mono bg-emerald-700 text-white">
                      Converted to {item.converted_entity_type}
                    </Badge>
                  )}
                </div>

                {item.content && (
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 pl-5">
                    {item.content}
                  </p>
                )}

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--primary)] hover:underline pl-5"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>{item.url}</span>
                  </a>
                )}
              </div>

              {/* Triage / Action Controls */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                {item.status === "unprocessed" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleTriageToTask(item)}
                      disabled={processingId === item.id}
                      className="h-8 px-3 text-xs gap-1.5 shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Convert to Task</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(item)}
                      className="h-8 px-2.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      title="Dismiss item"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  </>
                ) : null}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  className="h-8 px-2 text-xs text-[var(--muted-foreground)] hover:text-red-600"
                  title="Delete item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
