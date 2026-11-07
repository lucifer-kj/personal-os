"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "@/components/search/CommandPalette";
import { Toaster } from "sonner";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleQuickCapture = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("personal-os:quick-capture"));
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
      {/* Desktop Persistent Left Sidebar */}
      <React.Suspense fallback={<div className="hidden lg:flex w-64 border-r border-[var(--border)] bg-[var(--card)]" />}>
        <Sidebar />
      </React.Suspense>

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <React.Suspense fallback={<header className="h-14 border-b border-[var(--border)] bg-[var(--background)]" />}>
          <Header
            onOpenMobileMenu={toggleMobileMenu}
            onQuickCapture={handleQuickCapture}
          />
        </React.Suspense>

        <div className="flex-1 w-full overflow-y-auto">
          {children}
        </div>

        {/* Mobile Navigation and Drawer */}
        <React.Suspense fallback={null}>
          <MobileNav
            isMenuOpen={mobileMenuOpen}
            onToggleMenu={toggleMobileMenu}
            onCloseMenu={closeMobileMenu}
            onQuickCapture={handleQuickCapture}
          />
        </React.Suspense>
      </div>

      {/* Global Command Palette */}
      <React.Suspense fallback={null}>
        <CommandPalette />
      </React.Suspense>

      {/* Global Notifications */}
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
