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
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-[#EDE7DE] dark:border-[#262220] bg-white/70 dark:bg-[#12100E]/80 max-lg:bg-[#0D0B0A] max-lg:border-white/10 max-lg:text-white backdrop-blur-xl px-4 sm:px-6 lg:px-8 transition-all">
      {/* Mobile Top Bar (< lg) */}
      <div className="flex lg:hidden items-center justify-between w-full">
        {/* Left Mobile Actions (Theme, Search, Notifications) */}
        <div className="flex items-center gap-1.5 -ml-1">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={handleOpenSearch}
            className="p-2 text-[#A69E94] hover:text-white transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#A69E94] hover:text-white transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#E05B27] ring-2 ring-[#0D0B0A]" />
            )}
          </button>
        </div>

        {/* Centered Mobile Brand */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full overflow-hidden border border-white/20 shadow-2xs">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-cover" priority />
          </div>
          <div className="flex flex-col text-center">
            <span className="font-serif font-medium text-sm text-white leading-tight">
              Personal OS
            </span>
            <span className="text-[9px] text-[#E07A50] font-sans tracking-wide">
              Arif&apos;s Sanctuary
            </span>
          </div>
        </div>

        {/* Right Mobile Navigation Menu Trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -mr-2 text-[#A69E94] hover:text-white transition-colors cursor-pointer"
          aria-label="More options / Open navigation menu"
          title="More options"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Notification Popover */}
        {showNotifications && (
          <div className="absolute left-4 top-[calc(var(--header-height)+4px)] w-[calc(100vw-32px)] max-w-sm rounded-2xl bg-[#1C1917] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <p className="text-xs font-semibold text-white">Signals & Alerts</p>
              {hasUnread && (
                <button
                  type="button"
                  onClick={() => setHasUnread(false)}
                  className="text-[10px] text-[#E07A50] hover:underline cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
            <div className="py-2 space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/8">
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Deep Focus Ready</span>
                </div>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Start your scheduled 25m focus sprint for today.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/8">
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E05B27]" />
                  <span>The Radar Signal</span>
                </div>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Curated RSS insights ready to review.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Left Breadcrumb Navigation (>= lg) */}
      <div className="hidden lg:flex items-center gap-2 text-xs font-mono tracking-wide text-[#7A7269] dark:text-[#A69E94]">
        <span>Personal OS</span>
        <span className="text-[#C5BCB2] dark:text-neutral-600">/</span>
        <span className="text-[#24211F] dark:text-[#F3EFEA] font-medium">{currentRoute.title}</span>
      </div>

      {/* Desktop Center/Right Controls (>= lg) */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Command Search Pill Input */}
        <button
          type="button"
          onClick={handleOpenSearch}
          className="flex items-center gap-2.5 w-64 xl:w-72 rounded-full border border-[#EDE7DE] dark:border-[#2C2724] bg-white/80 dark:bg-[#1A1715]/90 px-3.5 py-1.5 text-xs text-[#968E85] dark:text-[#8E867C] shadow-2xs hover:border-[#D8CFBF] dark:hover:border-[#3D3733] transition-all cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 text-[#A0988E]" />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F7F4EF] dark:bg-[#25211E] border border-[#E8E1D7] dark:border-[#332E2A] text-[#7A7269] dark:text-[#A69E94]">
            ⌘K
          </kbd>
        </button>

        {/* State Preview Modal Trigger */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("personal-os:state-preview"));
            }
          }}
          className="relative h-9 w-9 rounded-full flex items-center justify-center text-[#7A7269] hover:text-[#24211F] dark:text-[#A69E94] dark:hover:text-[#F3EFEA] hover:bg-[#F7F4EF] dark:hover:bg-[#1C1917] transition-colors cursor-pointer"
          aria-label="Preview app states"
          title="Preview app states & devices"
        >
          <Sparkles className="h-4 w-4 text-[#B94A24] dark:text-[#E07A50]" />
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
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#EDE7DE] dark:border-[#2C2724] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2EDE6] dark:border-[#282421]">
                <p className="text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA]">Signals & Alerts</p>
                {hasUnread && (
                  <button
                    type="button"
                    onClick={() => setHasUnread(false)}
                    className="text-[10px] text-[#B94A24] dark:text-[#E07A50] hover:underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-[#F7F4EF]/70 dark:bg-[#25211E]/50 border border-[#EDE7DE]/60 dark:border-[#2C2724]">
                  <div className="flex items-center gap-1.5 font-medium text-[#24211F] dark:text-[#F3EFEA]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Deep Focus Ready</span>
                  </div>
                  <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94] mt-0.5">
                    Start your scheduled 25m focus sprint for today.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-[#F7F4EF]/70 dark:bg-[#25211E]/50 border border-[#EDE7DE]/60 dark:border-[#2C2724]">
                  <div className="flex items-center gap-1.5 font-medium text-[#24211F] dark:text-[#F3EFEA]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E05B27]" />
                    <span>The Radar Signal</span>
                  </div>
                  <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94] mt-0.5">
                    Curated RSS insights ready to review.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary + New / + Capture Button */}
        <Button
          size="sm"
          onClick={onQuickCapture}
          aria-label="Capture"
          className="h-9 px-4 rounded-full bg-[#1F1D1B] hover:bg-[#33302C] active:scale-95 text-white dark:bg-[#FAF7F2] dark:text-[#1F1D1B] dark:hover:bg-white text-xs font-medium gap-1.5 shadow-xs transition-transform"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </Button>

        {/* User Profile Monogram Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative flex items-center justify-center h-8 w-8 rounded-full bg-[#B94A24] text-white font-serif font-medium text-xs shadow-xs ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-white dark:ring-offset-[#12100E] active:scale-95 transition-all cursor-pointer"
            aria-label="User account menu"
          >
            A
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#EDE7DE] dark:border-[#2C2724] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#F2EDE6] dark:border-[#282421]">
                <p className="text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA]">Arif</p>
                <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94] truncate">321arifali@gmail.com</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 font-mono">
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#24211F] dark:text-[#F3EFEA] hover:bg-[#F7F4EF] dark:hover:bg-[#25211E] rounded-lg transition-colors text-left"
                >
                  <Settings className="h-3.5 w-3.5 text-[#7A7269]" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-left"
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
