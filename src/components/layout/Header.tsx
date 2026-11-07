"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Search, Plus, Bell, Command, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const routeTitleMap: Record<string, { title: string; category?: string }> = {
  "/": { title: "Today Overview", category: "Workspace" },
  "/tasks": { title: "Tasks", category: "Productivity" },
  "/inbox": { title: "Inbox", category: "Capture" },
  "/projects": { title: "Projects", category: "Work" },
  "/calendar": { title: "Calendar", category: "Schedule" },
  "/notes": { title: "Notes", category: "Knowledge" },
  "/habits": { title: "Habits", category: "Routines" },
  "/journal": { title: "Journal", category: "Reflection" },
  "/settings": { title: "Settings", category: "System" },
  "/login": { title: "Sign In", category: "Authentication" },
  "/signup": { title: "Owner Initialization", category: "Authentication" },
  "/forgot-password": { title: "Password Recovery", category: "Authentication" },
  "/reset-password": { title: "Set New Password", category: "Authentication" },
};

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onQuickCapture?: () => void;
}

export function Header({ onOpenMobileMenu, onQuickCapture }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const currentRoute = routeTitleMap[pathname] || {
    title: pathname?.replace("/", "") || "Dashboard",
    category: "Workspace",
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
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 transition-all">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileMenu}
            className="lg:hidden text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex flex-col">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
            <span>{currentRoute.category}</span>
            <span>/</span>
            <span className="text-[var(--foreground)]">{currentRoute.title}</span>
          </div>
          <h1 className="font-serif font-medium text-lg sm:text-xl text-[var(--foreground)] leading-tight">
            {currentRoute.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions or Auth Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthPage ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-[11px] font-mono text-[var(--muted-foreground)] shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Single-User Secure Enclave</span>
          </div>
        ) : (
          <>
            {/* Search Bar / Command Palette Trigger */}
            <button
              type="button"
              onClick={handleOpenSearch}
              className="hidden md:flex items-center gap-3 h-9 px-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)] hover:border-[var(--ring)] transition-colors shadow-2xs cursor-pointer"
              aria-label="Open Command Search"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search or jump to...</span>
              <kbd className="flex items-center gap-0.5 rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] border border-[var(--border)]">
                <Command className="h-2.5 w-2.5 inline" /> K
              </kbd>
            </button>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenSearch}
              className="md:hidden text-[var(--muted-foreground)]"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>

            {/* Primary Quick Capture / Action Button */}
            <Button
              variant="default"
              size="sm"
              onClick={onQuickCapture}
              className="gap-1.5 shadow-sm text-xs font-semibold px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Capture</span>
            </Button>

            {/* Sign Out Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-[var(--muted-foreground)] hover:text-red-600 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
