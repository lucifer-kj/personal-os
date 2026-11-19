"use client";

import * as React from "react";
import { Search, ChevronDown } from "lucide-react";
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
  const tabs: { label: string; shortLabel: string; value: ProjectStatusFilterOption }[] = [
    { label: "All", shortLabel: "All", value: "all" },
    { label: "Active", shortLabel: "Active", value: "active" },
    { label: "Planned", shortLabel: "Plan", value: "planned" },
    { label: "Completed", shortLabel: "Done", value: "completed" },
    { label: "Archived", shortLabel: "Archive", value: "archived" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Status Segmented Tabs */}
      <div className="grid grid-cols-5 sm:flex sm:items-center rounded-lg bg-[var(--muted)] p-1 border border-[var(--border)] w-full sm:w-auto shrink-0 gap-0.5 sm:gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-label={tab.label}
            onClick={() => onStatusFilterChange(tab.value)}
            className={cn(
              "h-7 px-1 sm:px-3 rounded-md text-[11px] sm:text-xs font-medium justify-center items-center flex transition-all duration-[var(--motion-fast)]",
              statusFilter === tab.value
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
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
            className="pl-8.5 h-9 text-xs bg-[var(--card)] rounded-lg"
          />
        </div>

        <div className="relative shrink-0 flex items-center">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as ProjectPriority | "all")}
            aria-label="Filter by priority"
            className="h-9 rounded-lg border border-[var(--input)] bg-[var(--card)] pl-3 pr-8 text-xs text-[var(--foreground)] appearance-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors hover:border-[var(--ring)]/50"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
        </div>
      </div>
    </div>
  );
}
