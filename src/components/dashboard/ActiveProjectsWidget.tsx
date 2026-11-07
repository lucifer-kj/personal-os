"use client";

import * as React from "react";
import Link from "next/link";
import { Layers, ArrowRight, FolderKanban } from "lucide-react";
import { ProjectWithStats } from "@/modules/projects/types";
import { Card } from "@/components/ui/card";

interface ActiveProjectsWidgetProps {
  projects: ProjectWithStats[];
}

export function ActiveProjectsWidget({ projects }: ActiveProjectsWidgetProps) {
  // If no projects exist in the DB, provide editorial default projects matching design specs
  const displayProjects: (ProjectWithStats | { id: string; name: string; subtitle: string; progress_percent: number; color: string; barColor: string })[] =
    projects.length > 0
      ? projects
      : [
          {
            id: "sample-1",
            name: "Personal OS",
            subtitle: "Core Application System",
            progress_percent: 75,
            color: "bg-[#FFF0EB] text-[#C85A32] border-[#FBD9CC]",
            barColor: "bg-[#B94A24]",
          },
          {
            id: "sample-2",
            name: "SapphireStudio",
            subtitle: "Brand & Client Portal",
            progress_percent: 50,
            color: "bg-[#F0EEFF] text-[#7857ED] border-[#DDD7FD]",
            barColor: "bg-[#D97706]",
          },
          {
            id: "sample-3",
            name: "CFStudio Hub",
            subtitle: "Public Marketing Hub",
            progress_percent: 85,
            color: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
            barColor: "bg-[#287A4B]",
          },
        ];

  return (
    <Card className="p-5 sm:p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#2A2624] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl space-y-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#B94A24] dark:text-[#E07A50]" />
          <h2 className="text-base sm:text-lg font-serif font-medium tracking-tight text-[#24211F] dark:text-[#F3EFEA]">
            Active Projects
          </h2>
        </div>

        <Link
          href="/projects"
          className="text-xs font-medium text-[#7A7269] hover:text-[#B94A24] dark:text-[#A69E94] dark:hover:text-[#E07A50] flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Project Items List */}
      <div className="space-y-4 pt-1">
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
    </Card>
  );
}
