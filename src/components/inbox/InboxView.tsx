"use client";

import * as React from "react";
import { InboxItem } from "@/modules/inbox/types";
import { InboxList } from "./InboxList";
import { QuickCaptureModal } from "./QuickCaptureModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface InboxViewProps {
  initialItems: InboxItem[];
}

export function InboxView({ initialItems }: InboxViewProps) {
  const [items, setItems] = React.useState<InboxItem[]>(initialItems);
  const [isCaptureOpen, setIsCaptureOpen] = React.useState(false);

  // Refresh items from API
  const refreshItems = async () => {
    try {
      const res = await fetch("/api/v1/inbox?status=all");
      if (res.ok) {
        const json = await res.json();
        setItems(json.data);
      }
    } catch (err) {
      console.error("Failed to refresh inbox:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[var(--foreground)]">
            Capture Inbox
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-serif italic mt-1">
            Capture raw thoughts, links, and flashes of inspiration before triaging.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCaptureOpen(true)}
          className="gap-1.5 text-xs shadow-xs h-9 px-4 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Capture</span>
        </Button>
      </div>

      {/* Inbox Items List */}
      <InboxList
        initialItems={items}
        onTriageItem={refreshItems}
        onDismissItem={refreshItems}
        onDeleteItem={refreshItems}
      />

      {/* Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        onCaptured={refreshItems}
      />
    </div>
  );
}
