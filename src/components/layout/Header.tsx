"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Plus, Bell, Menu, LogOut, Settings, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { ThemeToggle } from "@/components/brand/ThemeToggle";

const routeTitleMap: Record<string, { title: string; category?: string }> = {
  "/": { title: "Dashboard", category: "Personal OS" },
  "/tasks": { title: "Tasks", category: "Personal OS" },
  "/inbox": { title: "Inbox", category: "Personal OS" },
  "/projects": { title: "Projects", category: "Personal OS" },
  "/calendar": { title: "Calendar", category: "Personal OS" },
  "/notes": { title: "Notes", category: "Personal OS" },
  "/habits": { title: "Habits", category: "Personal OS" },
  "/journal": { title: "Journal", category: "Personal OS" },
  "/leads": { title: "Leads & Clients", category: "Personal OS" },
  "/focus": { title: "Focus Mode", category: "Personal OS" },
  "/studio": { title: "Social Studio", category: "Personal OS" },
  "/radar": { title: "The Radar", category: "Personal OS" },
  "/settings": { title: "Settings", category: "Personal OS" },
  "/login": { title: "Sign In", category: "Authentication" },
  "/signup": { title: "Owner Initialization", category: "Authentication" },
};

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onQuickCapture?: () => void;
}

export function Header({ onOpenMobileMenu, onQuickCapture }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [hasUnread, setHasUnread] = React.useState(true);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const currentRoute = routeTitleMap[pathname] || {
    title: pathname?.replace("/", "") || "Dashboard",
    category: "Personal OS",
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleOpenSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("personal-os:command-palette"));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Mobile Top Bar (< lg) */}
      <div className="flex lg:hidden items-center justify-between w-full">
        {/* Left Mobile Actions (Theme, Search, Notifications) */}
        <div className="flex items-center gap-1.5 -ml-1">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={handleOpenSearch}
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95 transition-all cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95 transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--primary)] ring-2 ring-[var(--card)]" />
            )}
          </button>
        </div>

        {/* Centered Mobile Brand */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full overflow-hidden border border-[var(--border)] shadow-2xs">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-cover" priority />
          </div>
          <div className="flex flex-col text-center">
            <span className="font-serif font-medium text-sm text-[var(--foreground)] leading-tight">
              Personal OS
            </span>
            <span className="text-[9px] text-[var(--primary)] font-sans tracking-wide">
              Arif&apos;s Sanctuary
            </span>
          </div>
        </div>

        {/* Right Mobile Navigation Menu Trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -mr-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95 transition-all cursor-pointer"
          aria-label="More options / Open navigation menu"
          title="More options"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Notification Popover */}
        {showNotifications && (
          <div className="absolute left-4 top-[calc(var(--header-height)+4px)] w-[calc(100vw-32px)] max-w-sm rounded-2xl bg-[var(--popover)] border border-[var(--border)] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--foreground)]">Signals & Alerts</p>
              {hasUnread && (
                <button
                  type="button"
                  onClick={() => setHasUnread(false)}
                  className="text-[10px] text-[var(--primary)] hover:underline cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
            <div className="py-2 space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                <div className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Deep Focus Ready</span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Start your scheduled 25m focus sprint for today.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                <div className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  <span>The Radar Signal</span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Curated RSS insights ready to review.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Left Breadcrumb Navigation (>= lg) */}
      <div className="hidden lg:flex items-center gap-2 text-xs font-mono tracking-wide text-[var(--muted-foreground)]">
        <span>Personal OS</span>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--foreground)] font-medium">{currentRoute.title}</span>
      </div>

      {/* Desktop Center/Right Controls (>= lg) */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Command Search Pill Input */}
        <button
          type="button"
          onClick={handleOpenSearch}
          className="flex items-center gap-2.5 w-64 xl:w-72 rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-1.5 text-xs text-[var(--muted-foreground)] shadow-2xs hover:border-[var(--primary)]/40 active:scale-[0.99] transition-all cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <span className="flex-1 text-left">Search or ask anything...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)]">
            ⌘K
          </kbd>
        </button>

        {/* Theme Mode Toggle */}
        <ThemeToggle compact />

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative h-9 w-9 rounded-full flex items-center justify-center text-[#7A7269] hover:text-[#24211F] dark:text-[#A69E94] dark:hover:text-[#F3EFEA] hover:bg-[#F7F4EF] dark:hover:bg-[#1C1917] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#E05B27] ring-2 ring-white dark:ring-[#12100E]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-[var(--popover)] border border-[var(--border)] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--foreground)]">Signals & Alerts</p>
                {hasUnread && (
                  <button
                    type="button"
                    onClick={() => setHasUnread(false)}
                    className="text-[10px] text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                  <div className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Deep Focus Ready</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    Start your scheduled 25m focus sprint for today.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                  <div className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                    <span>The Radar Signal</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    Curated RSS insights ready to review.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary + New Action Button */}
        <Button
          size="sm"
          onClick={onQuickCapture}
          aria-label="Capture"
          className="h-8 px-3.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 active:scale-95 text-[var(--primary-foreground)] text-xs font-medium gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </Button>

        {/* User Profile Monogram Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative flex items-center justify-center h-8 w-8 rounded-full bg-[var(--primary)] text-white font-serif font-medium text-xs shadow-xs ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-[var(--card)] active:scale-95 transition-all cursor-pointer"
            aria-label="User account menu"
          >
            A
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[var(--popover)] border border-[var(--border)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--foreground)]">Arif</p>
                <p className="text-[11px] text-[var(--muted-foreground)] truncate">321arifali@gmail.com</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Enclave Active</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/settings");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-500/10 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
