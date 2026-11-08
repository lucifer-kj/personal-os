"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { TaskPriority } from "@/modules/tasks/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type StatusFilterOption = "all" | "active" | "completed";

interface TaskFilterBarProps {
  statusFilter: StatusFilterOption;
  onStatusFilterChange: (option: StatusFilterOption) => void;
  priorityFilter: TaskPriority | "all";
  onPriorityFilterChange: (priority: TaskPriority | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TaskFilterBar({
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  searchQuery,
  onSearchChange,
}: TaskFilterBarProps) {
  const tabs: { label: string; value: StatusFilterOption }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Status Segmented Tabs */}
      <div className="h-9 flex items-center rounded-lg bg-[var(--muted)] p-1 border border-[var(--border)] shrink-0 self-start sm:self-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onStatusFilterChange(tab.value)}
            className={cn(
              "h-7 px-3 rounded-md text-xs font-medium flex items-center transition-all duration-[var(--motion-fast)]",
              statusFilter === tab.value
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Priority Dropdown */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md self-stretch sm:self-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="pl-8.5 h-9 text-xs bg-[var(--card)] rounded-lg"
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as TaskPriority | "all")}
            aria-label="Filter by priority"
            className="h-9 rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 text-xs text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] flex items-center"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
