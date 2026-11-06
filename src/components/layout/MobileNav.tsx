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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const primaryMobileTabs = [
    { title: "Today", href: "/", icon: LayoutDashboard },
    { title: "Tasks", href: "/tasks", icon: CheckSquare },
    { title: "Capture", isAction: true, onClick: onQuickCapture, icon: Plus },
    { title: "Calendar", href: "/calendar", icon: Calendar },
    { title: "More", isMenuTrigger: true, icon: MoreHorizontal },
  ];

  const secondaryDrawerItems = [
    { title: "Focus Mode", href: "/focus", icon: Flame },
    { title: "Inbox", href: "/inbox", icon: Inbox },
    { title: "Projects", href: "/projects", icon: FolderKanban },
    { title: "Notes", href: "/notes", icon: FileText },
    { title: "Habits", href: "/habits", icon: Flame },
    { title: "Journal", href: "/journal", icon: BookOpen },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md px-2 pb-safe"
      >
        {primaryMobileTabs.map((tab) => {
          if (tab.isAction) {
            return (
              <button
                key="mobile-quick-action"
                type="button"
                onClick={tab.onClick}
                className="flex flex-col items-center justify-center p-2 text-[var(--primary)] active:scale-95 transition-transform"
                aria-label="Quick Capture"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">
                  <Plus className="h-5 w-5" />
                </div>
              </button>
            );
          }

          if (tab.isMenuTrigger) {
            return (
              <button
                key="mobile-more-trigger"
                type="button"
                onClick={onToggleMenu}
                className={cn(
                  "flex min-w-[56px] min-h-[44px] flex-col items-center justify-center text-[10px] font-medium transition-colors",
                  isMenuOpen
                    ? "text-[var(--primary)] font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                aria-label="More options"
                aria-expanded={isMenuOpen}
              >
                <MoreHorizontal className="h-5 w-5 mb-0.5" />
                <span>More</span>
              </button>
            );
          }

          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href!}
              prefetch={false}
              className={cn(
                "flex min-w-[56px] min-h-[44px] flex-col items-center justify-center text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[var(--primary)] font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{tab.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Drawer / Backdrop */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={onCloseMenu}
        >
          <div
            className="w-full rounded-t-[var(--radius-panel)] border-t border-[var(--border)] bg-[var(--card)] p-6 shadow-xl pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <span className="font-serif font-medium text-base text-[var(--foreground)]">
                More Destinations
              </span>
              <button
                type="button"
                onClick={onCloseMenu}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Close Drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-4">
              {secondaryDrawerItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={onCloseMenu}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-[var(--radius-control)] border text-sm font-medium transition-colors",
                      isActive
                        ? "border-[var(--primary)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                    )}
                  >
                    <Icon className="h-4 w-4 text-[var(--primary)] shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
