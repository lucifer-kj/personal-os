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
  Sparkles,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const primaryNavItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Focus Mode", href: "/focus", icon: Timer },
  { title: "Inbox", href: "/inbox", icon: Inbox },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Notes", href: "/notes", icon: FileText },
  { title: "Habits", href: "/habits", icon: Flame },
  { title: "Journal", href: "/journal", icon: BookOpen },
  { title: "Studio", href: "/studio", icon: Share2 },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex w-[var(--sidebar-width)] flex-col justify-between border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] p-4 select-none shrink-0 min-h-screen",
        className
      )}
    >
      <div className="flex flex-col space-y-6">
        {/* Workspace Brand / Header */}
        <div className="flex items-center justify-between px-2 pt-2 pb-1">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 shadow-xs border border-[var(--border)] transition-transform group-hover:scale-105">
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
              <span className="font-serif font-medium text-base text-[var(--foreground)] tracking-tight leading-none">
                Personal OS
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--muted-foreground)] mt-1">
                Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-medium tracking-wider uppercase text-[var(--muted-foreground)]">
            Productivity
          </div>
          {primaryNavItems.map((item) => {
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
                  "flex items-center justify-between gap-3 px-3 py-2 rounded-[var(--radius-control)] text-sm font-medium transition-colors duration-[var(--motion-fast)]",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold shadow-2xs"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-[var(--sidebar-primary)]"
                        : "text-[var(--muted-foreground)]"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Settings & Workspace state */}
      <div className="flex flex-col space-y-1 pt-4 border-t border-[var(--sidebar-border)]">
        <Link
          href="/settings"
          prefetch={false}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-control)] text-sm font-medium transition-colors duration-[var(--motion-fast)]",
            pathname === "/settings"
              ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
              : "text-[var(--sidebar-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Settings className="h-4 w-4 text-[var(--muted-foreground)]" />
          <span>Settings</span>
        </Link>

        {/* Quiet Pro / Identity Pill */}
        <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            <span className="font-medium text-[var(--foreground)]">Private Mode</span>
          </div>
          <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
        </div>
      </div>
    </aside>
  );
}
