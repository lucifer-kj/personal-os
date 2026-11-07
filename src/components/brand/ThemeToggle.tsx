"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className = "", compact = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-full p-2 transition-all duration-200 active:scale-95 text-[#7A7269] hover:text-[#24211F] dark:text-[#A69E94] dark:hover:text-white hover:bg-[#F2ECE3] dark:hover:bg-[#1E1B19] cursor-pointer ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative h-4 w-4">
        {/* Sun Icon */}
        <Sun
          className={`h-4 w-4 text-amber-500 absolute inset-0 transition-all duration-300 transform ${
            isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`h-4 w-4 text-orange-400 absolute inset-0 transition-all duration-300 transform ${
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
          }`}
        />
      </div>
      {!compact && (
        <span className="ml-2 text-xs font-medium capitalize">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
