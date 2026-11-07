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
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

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

// Page 1: Core Productivity
const page1Sections: NavSection[] = [
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
];

// Page 2: Extended Knowledge & Routines
const page2Sections: NavSection[] = [
  {
    title: "Library",
    items: [
      { title: "Notes", href: "/notes", icon: FileText },
      { title: "The Radar", href: "/radar", icon: Radio },
      { title: "Habits", href: "/habits", icon: Flame },
      { title: "Journal", href: "/journal", icon: BookOpen },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [navPage, setNavPage] = React.useState<1 | 2>(1);

  // Automatically switch pagination page if active route is on Page 2
  React.useEffect(() => {
    const isPage2Active = page2Sections.some((s) =>
      s.items.some((i) => pathname === i.href || pathname?.startsWith(`${i.href}/`))
    );
    if (isPage2Active) {
      setNavPage(2);
    }
  }, [pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const currentSections = navPage === 1 ? page1Sections : page2Sections;

  return (
    <aside
      className={cn(
        "hidden lg:flex sticky top-0 h-screen z-30 flex-col justify-between border-r border-[#EDE7DE] dark:border-[#262220] bg-[#FAF8F5] dark:bg-[#12100E] text-[#5C554E] dark:text-[#A69E94] select-none shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isCollapsed ? "w-[76px] p-2.5" : "w-[var(--sidebar-width)] p-4",
        className
      )}
    >
      {/* 1. Header with Logo & Collapse Toggle */}
      <div className="shrink-0 flex items-center justify-between pb-3 border-b border-[#EDE7DE] dark:border-[#262220]">
        <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
          <Logo size={32} showText={!isCollapsed} subtitle="Arif's Sanctuary" />
        </Link>

        <button
          type="button"
          onClick={toggleCollapse}
          className="text-[#968E85] hover:text-[#24211F] dark:hover:text-[#F3EFEA] p-1.5 rounded-lg hover:bg-[#F2ECE3] dark:hover:bg-[#1E1B19] transition-all cursor-pointer active:scale-90"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* 2. Pagination Pill Selector (Core vs More) */}
      {!isCollapsed ? (
        <div className="shrink-0 pt-3 pb-2 flex items-center justify-between gap-1">
          <div className="flex items-center rounded-full border border-[#EDE7DE] dark:border-[#2A2624] bg-[#F2EDE6] dark:bg-[#1A1715] p-0.5 w-full">
            <button
              type="button"
              onClick={() => setNavPage(1)}
              className={cn(
                "flex-1 py-1 rounded-full text-[11px] font-medium transition-all text-center",
                navPage === 1
                  ? "bg-white dark:bg-[#282421] text-[#24211F] dark:text-white font-semibold shadow-2xs"
                  : "text-[#7A7269] dark:text-[#A69E94] hover:text-[#24211F]"
              )}
            >
              Core (1)
            </button>
            <button
              type="button"
              onClick={() => setNavPage(2)}
              className={cn(
                "flex-1 py-1 rounded-full text-[11px] font-medium transition-all text-center",
                navPage === 2
                  ? "bg-white dark:bg-[#282421] text-[#24211F] dark:text-white font-semibold shadow-2xs"
                  : "text-[#7A7269] dark:text-[#A69E94] hover:text-[#24211F]"
              )}
            >
              More (2)
            </button>
          </div>
        </div>
      ) : (
        <div className="shrink-0 py-2 flex justify-center gap-1">
          <button
            type="button"
            onClick={() => setNavPage(1)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              navPage === 1 ? "bg-[#B94A24] scale-125" : "bg-[#D8D0C5] dark:bg-[#332E2A]"
            )}
            aria-label="Core workstations"
          />
          <button
            type="button"
            onClick={() => setNavPage(2)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              navPage === 2 ? "bg-[#B94A24] scale-125" : "bg-[#D8D0C5] dark:bg-[#332E2A]"
            )}
            aria-label="More workstations"
          />
        </div>
      )}

      {/* 3. Scrollable Middle Navigation Area */}
      <div className="flex-1 overflow-y-auto min-h-0 py-2 pr-1 space-y-5 scrollbar-thin">
        {currentSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[11px] font-mono tracking-wider uppercase text-[#968E85] dark:text-[#7A7269]">
                {section.title}
              </div>
            )}

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
                  title={isCollapsed ? item.title : undefined}
                  className={cn(
                    "flex items-center rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.98]",
                    isCollapsed
                      ? "justify-center h-10 w-full p-2"
                      : "justify-between gap-3 px-3 py-2",
                    isActive
                      ? "bg-[#F5EBE1] text-[#A84A28] dark:bg-[#2C1C15] dark:text-[#E87A54] font-semibold shadow-2xs"
                      : "text-[#5C554E] dark:text-[#A69E94] hover:bg-[#F2ECE3] dark:hover:bg-[#1E1B19] hover:text-[#24211F] dark:hover:text-[#F3EFEA]"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive
                          ? "text-[#A84A28] dark:text-[#E87A54]"
                          : "text-[#7A7269] dark:text-[#8E867C]"
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </div>

                  {!isCollapsed && item.badge !== undefined && (
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
      </div>

      {/* 4. Fixed Bottom Area (Settings & User Profile Pinned) */}
      <div className="shrink-0 sticky bottom-0 bg-[#FAF8F5] dark:bg-[#12100E] pt-3 border-t border-[#EDE7DE] dark:border-[#262220] space-y-2">
        {/* Fixed Settings Item */}
        <Link
          href="/settings"
          prefetch={false}
          title={isCollapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.98]",
            isCollapsed
              ? "justify-center h-10 w-full p-2"
              : "justify-between gap-3 px-3 py-2",
            pathname === "/settings"
              ? "bg-[#F5EBE1] text-[#A84A28] dark:bg-[#2C1C15] dark:text-[#E87A54] font-semibold"
              : "text-[#5C554E] dark:text-[#A69E94] hover:bg-[#F2ECE3] dark:hover:bg-[#1E1B19] hover:text-[#24211F]"
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Settings className="h-4 w-4 shrink-0 text-[#7A7269] dark:text-[#8E867C]" />
            {!isCollapsed && <span>Settings</span>}
          </div>
        </Link>

        {/* User Profile Footer */}
        <div
          className={cn(
            "flex items-center justify-between pt-1",
            isCollapsed ? "justify-center" : "px-2"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-[#B94A24] text-white flex items-center justify-center font-serif text-xs font-semibold shrink-0 shadow-2xs">
              A
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA] truncate">
                  Arif
                </span>
                <span className="text-[10px] text-[#968E85] dark:text-[#7A7269] truncate">
                  Personal Workspace
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              className="text-[#968E85] hover:text-[#24211F] dark:hover:text-[#F3EFEA] p-1 rounded-md transition-colors"
              aria-label="Workspace options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
