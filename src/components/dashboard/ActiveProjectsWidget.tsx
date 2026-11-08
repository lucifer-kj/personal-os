"use client";

import * as React from "react";
import Link from "next/link";
import { Layers, ArrowRight, FolderKanban } from "lucide-react";
import { ProjectWithStats } from "@/modules/projects/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActiveProjectsWidgetProps {
  projects: ProjectWithStats[];
  className?: string;
}

export function ActiveProjectsWidget({ projects, className }: ActiveProjectsWidgetProps) {
  // If no projects exist in the DB, provide ongoing projects matching user directives
  const displayProjects: (ProjectWithStats | { id: string; name: string; subtitle: string; progress_percent: number; color: string; barColor: string })[] =
    projects.length > 0
      ? projects
      : [
          {
            id: "nbd",
            name: "NBD",
            subtitle: "Client Deliverable & Operations",
            progress_percent: 65,
            color: "bg-[#FFF0EB] text-[#C85A32] border-[#FBD9CC]",
            barColor: "bg-[#B94A24]",
          },
          {
            id: "acov",
            name: "ACoV",
            subtitle: "Autonomous Agent Telemetry",
            progress_percent: 80,
            color: "bg-[#F0EEFF] text-[#7857ED] border-[#DDD7FD]",
            barColor: "bg-[#7857ED]",
          },
          {
            id: "fossil",
            name: "Fossil",
            subtitle: "Knowledge Graph & Memory Engine",
            progress_percent: 45,
            color: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
            barColor: "bg-[#D97706]",
          },
          {
            id: "friday",
            name: "Friday",
            subtitle: "Executive Assistant & Workflows",
            progress_percent: 70,
            color: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
            barColor: "bg-[#287A4B]",
          },
        ];

  return (
    <Card className={cn("p-5 sm:p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#2A2624] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl flex flex-col justify-between min-h-[380px] h-full transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#B94A24] dark:text-[#E07A50]" />
          <h2 className="text-base sm:text-lg font-serif font-medium tracking-tight text-[#24211F] dark:text-[#F3EFEA]">
            Active Projects
          </h2>
          <span className="text-xs font-mono text-[#968E85] dark:text-[#8E867C]">
            ({displayProjects.length})
          </span>
        </div>

        <Link
          href="/projects"
          className="text-xs font-medium text-[#7A7269] hover:text-[#B94A24] dark:text-[#A69E94] dark:hover:text-[#E07A50] flex items-center gap-1 transition-colors"
        >
          <span>Projects</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Project Items List */}
      <div className="space-y-4 my-auto py-2">
        {displayProjects.map((item, idx) => {
          const isReal = "stats" in item;
          const name = item.name;
          const subtitle = isReal ? (item as ProjectWithStats).description || "Deliverable" : (item as any).subtitle;
          const progress = isReal ? (item as ProjectWithStats).stats.progress_percent : (item as any).progress_percent;
          const href = isReal ? `/projects/${item.id}` : "/projects";
          const color = isReal
            ? idx % 3 === 0
              ? "bg-[#FFF0EB] text-[#C85A32] border-[#FBD9CC]"
              : idx % 3 === 1
              ? "bg-[#F0EEFF] text-[#7857ED] border-[#DDD7FD]"
              : "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
            : (item as any).color;
          const barColor = isReal
            ? idx % 3 === 0
              ? "bg-[#B94A24]"
              : idx % 3 === 1
              ? "bg-[#D97706]"
              : "bg-[#287A4B]"
            : (item as any).barColor;

          return (
            <Link key={item.id} href={href} className="block group">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${color} shadow-2xs transition-transform group-hover:scale-105`}
                  >
                    <FolderKanban className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#24211F] dark:text-[#F3EFEA] truncate group-hover:text-[#B94A24] transition-colors">
                      {name}
                    </p>
                    <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94] truncate">
                      {subtitle}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA] shrink-0">
                  {progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-[#F2EDE6] dark:bg-[#25211E] overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pinned Footer matching TodayAgenda */}
      <div className="mt-auto pt-3 border-t border-[#EDE7DE] dark:border-[#2A2624] flex justify-end">
        <Link
          href="/projects"
          className="text-xs font-medium text-[#B94A24] dark:text-[#E07A50] hover:underline flex items-center gap-1"
        >
          <span>View all projects</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
