"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  Inbox,
  FileText,
  Flame,
  BookOpen,
  Timer,
  Settings,
  Share2,
  Radio,
  MoreHorizontal,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Chronicle",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Tasks", href: "/tasks", icon: CheckSquare, badge: 12 },
      { title: "Calendar", href: "/calendar", icon: Calendar },
      { title: "Inbox", href: "/inbox", icon: Inbox, badge: 3 },
    ],
  },
  {
    title: "Atelier",
    items: [
      { title: "Focus Mode", href: "/focus", icon: Timer },
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Social Studio", href: "/studio", icon: Share2 },
    ],
  },
  {
    title: "Library",
    items: [
      { title: "Notes", href: "/notes", icon: FileText },
      { title: "The Radar", href: "/radar", icon: Radio },
      { title: "Habits", href: "/habits", icon: Flame },
      { title: "Journal", href: "/journal", icon: BookOpen },
    ],
  },
  {
    title: "Operations",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex w-[var(--sidebar-width)] flex-col justify-between border-r border-[#EDE7DE] dark:border-[#262220] bg-[#FAF8F5] dark:bg-[#12100E] text-[#5C554E] dark:text-[#A69E94] p-4 select-none shrink-0 min-h-screen",
        className
      )}
    >
      <div className="flex flex-col space-y-6">
        {/* Workspace Brand / Header */}
        <div className="flex items-center justify-between px-2 pt-2 pb-1">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 shadow-xs border border-[#E8DFD5] dark:border-white/10 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Personal OS Logo"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-medium text-base text-[#24211F] dark:text-[#F3EFEA] tracking-tight leading-none">
                Personal OS
              </span>
              <span className="text-[10px] font-sans text-[#A84A28] dark:text-[#E07A50] mt-1 tracking-wide">
                Arif&apos;s Sanctuary
              </span>
            </div>
          </Link>

          <button
            type="button"
            className="text-[#968E85] hover:text-[#24211F] dark:hover:text-[#F3EFEA] p-1 rounded-md transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Grouped Nav Sections */}
        <nav className="flex flex-col space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-mono tracking-wider uppercase text-[#968E85] dark:text-[#7A7269]">
                {section.title}
              </div>

              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.98]",
                      isActive
                        ? "bg-[#F5EBE1] text-[#A84A28] dark:bg-[#2C1C15] dark:text-[#E87A54] font-semibold shadow-2xs"
                        : "text-[#5C554E] dark:text-[#A69E94] hover:bg-[#F2ECE3] dark:hover:bg-[#1E1B19] hover:text-[#24211F] dark:hover:text-[#F3EFEA]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#A84A28] dark:text-[#E87A54]" : "text-[#7A7269] dark:text-[#8E867C]")} />
                      <span className="truncate">{item.title}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded-full font-mono text-[10px] font-semibold",
                          isActive
                            ? "bg-[#EBD6C7] text-[#A84A28] dark:bg-[#42291E] dark:text-[#E87A54]"
                            : "bg-[#EAE4DC] text-[#7A7269] dark:bg-[#24201D] dark:text-[#8E867C]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Footer Matching Reference */}
      <div className="pt-3 border-t border-[#EDE7DE] dark:border-[#262220] flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-[#B94A24] text-white flex items-center justify-center font-serif text-xs font-semibold shrink-0 shadow-2xs">
            A
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA] truncate">
              Arif
            </span>
            <span className="text-[10px] text-[#968E85] dark:text-[#7A7269] truncate">
              Personal Workspace
            </span>
          </div>
        </div>

        <button
          type="button"
          className="text-[#968E85] hover:text-[#24211F] dark:hover:text-[#F3EFEA] p-1 rounded-md transition-colors"
          aria-label="Workspace options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
