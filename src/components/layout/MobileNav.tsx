"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  Calendar,
  MoreHorizontal,
  X,
  Inbox,
  FolderKanban,
  FileText,
  Flame,
  BookOpen,
  Settings,
  Share2,
  Radio,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadWorkbenchConfig, WORKBENCH_CHANGE_EVENT } from "@/lib/sidebar-workbench";

interface MobileNavProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onQuickCapture?: () => void;
}

export function MobileNav({
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onQuickCapture,
}: MobileNavProps) {
  const pathname = usePathname();

  const navTabs = [
    { title: "Home", href: "/", icon: LayoutDashboard },
    { title: "Tasks", href: "/tasks", icon: CheckSquare },
    { title: "Capture", isCapture: true, icon: Plus },
    { title: "Calendar", href: "/calendar", icon: Calendar },
    { title: "Habits", href: "/habits", icon: Flame },
  ];

  const initialDrawerItems = [
    { title: "Projects", href: "/projects", icon: FolderKanban },
    { title: "Focus Mode", href: "/focus", icon: Timer },
    { title: "Inbox", href: "/inbox", icon: Inbox },
    { title: "Notes", href: "/notes", icon: FileText },
    { title: "Habits", href: "/habits", icon: Flame },
    { title: "Journal", href: "/journal", icon: BookOpen },
    { title: "Social Studio", href: "/studio", icon: Share2 },
    { title: "The Radar", href: "/radar", icon: Radio },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const [drawerItems, setDrawerItems] = React.useState(initialDrawerItems);

  React.useEffect(() => {
    const updateTitles = () => {
      const config = loadWorkbenchConfig();
      const allTools = [...config.core, ...config.more, ...config.vault];
      const nameMap = new Map(allTools.map((t) => [t.href, t.title]));

      setDrawerItems(
        initialDrawerItems.map((item) => ({
          ...item,
          title: nameMap.get(item.href) || item.title,
        }))
      );
    };

    updateTitles();
    window.addEventListener(WORKBENCH_CHANGE_EVENT, updateTitles);
    window.addEventListener("storage", updateTitles);
    return () => {
      window.removeEventListener(WORKBENCH_CHANGE_EVENT, updateTitles);
      window.removeEventListener("storage", updateTitles);
    };
  }, []);

  return (
    <>
      {/* Floating Apple-Style Mobile Dock (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-3 pt-1 pointer-events-none flex flex-col items-center">
        <nav
          aria-label="Mobile Navigation"
          className="pointer-events-auto w-full max-w-md flex items-center justify-between rounded-full border border-white/10 bg-[#161311]/92 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-3 py-1.5 transition-all text-[#8E867C]"
        >
          {navTabs.map((tab) => {
            const isHome = tab.href === "/";
            const isActive = isHome ? pathname === "/" : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
            const Icon = tab.icon;

            if (tab.isCapture) {
              return (
                <button
                  key="mobile-quick-capture"
                  type="button"
                  onClick={onQuickCapture}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-[#E05B27] hover:bg-[#C94D1D] active:scale-90 text-white shadow-md transition-transform cursor-pointer mx-1"
                  aria-label="Quick capture"
                  title="Quick capture"
                >
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                </button>
              );
            }

            return (
              <Link
                key={tab.title}
                href={tab.href!}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl transition-all duration-200 active:scale-95",
                  isActive
                    ? "bg-[#D25828] text-white px-3 py-1.5 shadow-sm font-semibold text-xs rounded-xl"
                    : "flex-col p-2 text-[#8E867C] hover:text-white rounded-xl"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", isActive ? "stroke-[2.5]" : "")} />
                <span className={cn(isActive ? "text-xs font-semibold" : "text-[10px] mt-0.5")}>
                  {tab.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* iOS Home Indicator Bar */}
        <div className="w-32 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 mt-2 opacity-60" />
      </div>

      {/* Secondary Drawer Sheet for "More" */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMenu}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 right-0 w-3/4 max-w-xs bg-white dark:bg-[#161413] border-l border-[#EDE7DE] dark:border-[#262220] p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#EDE7DE] dark:border-[#262220]">
                <span className="font-serif font-medium text-base text-[#24211F] dark:text-[#F3EFEA]">
                  More Destinations
                </span>
                <button
                  onClick={onCloseMenu}
                  className="p-1 rounded-md text-[#7A7269] hover:text-[#24211F] dark:text-[#A69E94]"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col space-y-1">
                {drawerItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMenu}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors",
                        isActive
                          ? "bg-[#F5EBE1] text-[#A84A28] dark:bg-[#2C1C15] dark:text-[#E87A54] font-semibold"
                          : "text-[#5C554E] dark:text-[#A69E94] hover:bg-[#F2ECE3] dark:hover:bg-[#1E1B19]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#EDE7DE] dark:border-[#262220] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#B94A24] text-white flex items-center justify-center font-serif text-xs font-semibold">
                  A
                </div>
                <span className="text-xs font-medium text-[#24211F] dark:text-[#F3EFEA]">
                  Arif&apos;s Enclave
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600">● Live</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
