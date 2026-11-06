"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { ProjectPriority } from "@/modules/projects/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ProjectStatusFilterOption = "all" | "active" | "planned" | "completed" | "archived";

interface ProjectFilterBarProps {
  statusFilter: ProjectStatusFilterOption;
  onStatusFilterChange: (option: ProjectStatusFilterOption) => void;
  priorityFilter: ProjectPriority | "all";
  onPriorityFilterChange: (priority: ProjectPriority | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProjectFilterBar({
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  searchQuery,
  onSearchChange,
}: ProjectFilterBarProps) {
  const tabs: { label: string; value: ProjectStatusFilterOption }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Planned", value: "planned" },
    { label: "Completed", value: "completed" },
    { label: "Archived", value: "archived" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
      {/* Status Segmented Tabs */}
      <div className="flex rounded-[var(--radius-control)] bg-[var(--muted)] p-1 border border-[var(--border)] shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onStatusFilterChange(tab.value)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-[var(--motion-fast)]",
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
            placeholder="Search projects..."
            className="pl-8.5 h-8.5 text-xs bg-[var(--card)]"
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as ProjectPriority | "all")}
            aria-label="Filter by priority"
            className="h-8.5 rounded-[var(--radius-control)] border border-[var(--input)] bg-[var(--card)] px-2.5 py-1 text-xs text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
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
