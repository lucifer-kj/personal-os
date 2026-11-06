"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

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
      <Sidebar />

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onOpenMobileMenu={toggleMobileMenu}
          onQuickCapture={handleQuickCapture}
        />

        <div className="flex-1 w-full overflow-y-auto">
          {children}
        </div>

        {/* Mobile Navigation and Drawer */}
        <MobileNav
          isMenuOpen={mobileMenuOpen}
          onToggleMenu={toggleMobileMenu}
          onCloseMenu={closeMobileMenu}
          onQuickCapture={handleQuickCapture}
        />
      </div>
    </div>
  );
}
