"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  MoreHorizontal,
  Settings,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import {
  WorkbenchConfig,
  DEFAULT_WORKBENCH,
  loadWorkbenchConfig,
  WORKBENCH_CHANGE_EVENT,
} from "@/lib/sidebar-workbench";
import { getSidebarIcon } from "./sidebar-icons";
import { SidebarCustomizerModal } from "./SidebarCustomizerModal";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [navPage, setNavPage] = React.useState<1 | 2>(1);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = React.useState(false);
  const [workbench, setWorkbench] = React.useState<WorkbenchConfig>(DEFAULT_WORKBENCH);
  const [isCustomizerOpen, setIsCustomizerOpen] = React.useState(false);

  // Long-press detection timer (600ms hold on any sidebar item)
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      setIsCustomizerOpen(true);
    }, 600);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Sync workbench config from localStorage on mount & on storage events
  React.useEffect(() => {
    setWorkbench(loadWorkbenchConfig());

    const handleUpdate = () => {
      setWorkbench(loadWorkbenchConfig());
    };

    window.addEventListener(WORKBENCH_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(WORKBENCH_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Automatically switch pagination page if active route is in 'more' page
  React.useEffect(() => {
    const isMoreActive = workbench.more.some(
      (i) => pathname === i.href || pathname?.startsWith(`${i.href}/`)
    );
    if (isMoreActive) {
      setNavPage(2);
    }
  }, [pathname, workbench.more]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const currentItems = navPage === 1 ? workbench.core : workbench.more;

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex sticky top-0 h-screen z-30 flex-col justify-between border-r border-[#EDE7DE] dark:border-[#262220] bg-[#FAF8F5] dark:bg-[#12100E] text-[#5C554E] dark:text-[#A69E94] select-none shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isCollapsed ? "w-[76px] p-2.5" : "w-[var(--sidebar-width)] p-4",
          className
        )}
      >
        {/* 1. Header with Logo & Collapse Toggle */}
        <div
          className={cn(
            "shrink-0 flex items-center pb-3 border-b border-[#EDE7DE] dark:border-[#262220]",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleCollapse}
              onMouseDown={handlePointerDown}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchEnd={handlePointerUp}
              className="flex items-center justify-center p-1 rounded-xl hover:bg-[#F2ECE3] dark:hover:bg-[#1E1B19] transition-all cursor-pointer active:scale-95"
              aria-label="Expand sidebar"
              title="Click to expand (or hold 600ms to customize)"
            >
              <Logo size={32} showText={false} />
            </button>
          ) : (
            <>
              <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
                <Logo size={32} showText={true} subtitle="Arif's Sanctuary" />
              </Link>

              <button
                type="button"
                onClick={toggleCollapse}
                className="text-[#968E85] hover:text-[#24211F] dark:hover:text-[#F3EFEA] p-1.5 rounded-lg hover:bg-[#F2ECE3] dark:hover:bg-[#1E1B19] transition-all cursor-pointer active:scale-90"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* 2. Pagination Pill Selector (Core vs More) */}
        {!isCollapsed ? (
          <div className="shrink-0 pt-3 pb-2 flex items-center justify-between gap-1">
            <div className="flex items-center rounded-full border border-[#EDE7DE] dark:border-[#2A2624] bg-[#F2EDE6] dark:bg-[#1A1715] p-0.5 w-full">
              <button
                type="button"
                onClick={() => setNavPage(1)}
                className={cn(
                  "flex-1 py-1 rounded-full text-[11px] font-medium transition-all text-center cursor-pointer",
                  navPage === 1
                    ? "bg-white dark:bg-[#282421] text-[#24211F] dark:text-white font-semibold shadow-2xs"
                    : "text-[#7A7269] dark:text-[#A69E94] hover:text-[#24211F]"
                )}
              >
                Core
              </button>
              <button
                type="button"
                onClick={() => setNavPage(2)}
                className={cn(
                  "flex-1 py-1 rounded-full text-[11px] font-medium transition-all text-center cursor-pointer",
                  navPage === 2
                    ? "bg-white dark:bg-[#282421] text-[#24211F] dark:text-white font-semibold shadow-2xs"
                    : "text-[#7A7269] dark:text-[#A69E94] hover:text-[#24211F]"
                )}
              >
                More
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
        <div className="flex-1 overflow-y-auto min-h-0 py-2 pr-1 space-y-1 scrollbar-thin">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[11px] font-mono tracking-wider uppercase text-[#968E85] dark:text-[#7A7269]">
              {navPage === 1 ? "Chronicle & Atelier" : "Knowledge & Feeds"}
            </div>
          )}

          {currentItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = getSidebarIcon(item.iconName);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                title={isCollapsed ? item.title : undefined}
                onMouseDown={handlePointerDown}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchEnd={handlePointerUp}
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

        {/* 4. Fixed Bottom Area (Settings & User Profile Pinned) */}
        <div className="shrink-0 sticky bottom-0 bg-[#FAF8F5] dark:bg-[#12100E] pt-3 border-t border-[#EDE7DE] dark:border-[#262220] space-y-2">
          {/* Fixed Settings Item */}
          <Link
            href="/settings"
            prefetch={false}
            title={isCollapsed ? "Settings" : undefined}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                  className="text-[#968E85] hover:text-[#24211F] dark:hover:text-[#F3EFEA] p-1 rounded-md transition-colors cursor-pointer"
                  aria-label="Workspace options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {showWorkspaceMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-52 rounded-xl bg-white dark:bg-[#1C1917] border border-[#EDE7DE] dark:border-[#2C2724] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 border-b border-[#F2EDE6] dark:border-[#282421]">
                      <p className="text-[11px] font-semibold text-[#24211F] dark:text-[#F3EFEA]">Workspace</p>
                      <p className="text-[10px] text-emerald-600 font-mono">Single-User Enclave</p>
                    </div>
                    <div className="py-1 space-y-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setShowWorkspaceMenu(false);
                          setIsCustomizerOpen(true);
                        }}
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg text-[#24211F] dark:text-[#F3EFEA] hover:bg-[#F7F4EF] dark:hover:bg-[#25211E] transition-colors cursor-pointer text-left"
                      >
                        <Sliders className="h-3.5 w-3.5 text-[#E05B27]" />
                        <span>Customize Layout</span>
                      </button>

                      <Link
                        href="/settings"
                        onClick={() => setShowWorkspaceMenu(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-[#24211F] dark:text-[#F3EFEA] hover:bg-[#F7F4EF] dark:hover:bg-[#25211E] transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5 text-[#7A7269]" />
                        <span>Preferences</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Two-Panel Glassmorphic Workstation Customizer HUD */}
      <SidebarCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        currentConfig={workbench}
        onSave={(newConfig) => setWorkbench(newConfig)}
      />
    </>
  );
}
