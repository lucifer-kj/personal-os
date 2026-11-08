"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "@/components/search/CommandPalette";
import { StatePreviewModal } from "@/components/preview/StatePreviewModal";
import { AppLockScreen } from "@/components/auth/AppLockScreen";
import { useAppLock } from "@/lib/hooks/useAppLock";
import { Toaster } from "sonner";

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [statePreviewOpen, setStatePreviewOpen] = React.useState(false);
  const lockState = useAppLock();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  React.useEffect(() => {
    const handleOpenPreview = () => setStatePreviewOpen(true);
    window.addEventListener("personal-os:state-preview", handleOpenPreview);
    return () => window.removeEventListener("personal-os:state-preview", handleOpenPreview);
  }, []);

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

  // If on login or auth screens, hide sidebar, mobile nav, and header completely for focused enclave entry
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased flex flex-col justify-center">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] max-lg:bg-[#0D0B0A] text-[var(--foreground)] antialiased">
      {/* Desktop Persistent Left Sidebar (Hidden on Login) */}
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

      {/* Interactive State & Device Simulation Modal */}
      <StatePreviewModal
        isOpen={statePreviewOpen}
        onClose={() => setStatePreviewOpen(false)}
      />

      {/* Biometric Mobile Reauthentication & Privacy Shield */}
      <AppLockScreen
        isShielded={lockState.isShielded}
        isLocked={lockState.isLocked}
        unlocking={lockState.unlocking}
        error={lockState.error}
        onUnlock={lockState.unlock}
      />

      {/* Global Notifications */}
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
          {children}
        </div>
      }
    >
      <AppShellContent>{children}</AppShellContent>
    </React.Suspense>
  );
}

