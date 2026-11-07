"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "personal_os_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  // Compute resolved theme based on screen size (desktop = light default, mobile = dark default)
  const computeTheme = React.useCallback((currentTheme: Theme): "light" | "dark" => {
    if (currentTheme === "light") return "light";
    if (currentTheme === "dark") return "dark";

    // "system" or initial: desktop (<1024px) defaults to dark, desktop (>=1024px) defaults to light
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 1024;
      return isMobile ? "dark" : "light";
    }
    return "light";
  }, []);

  // Initialize theme on mount
  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initialTheme: Theme = saved || "system";
    setThemeState(initialTheme);
    const resolved = computeTheme(initialTheme);
    setResolvedTheme(resolved);

    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Listen to resize if in "system" mode to adapt between desktop and mobile defaults
    const handleResize = () => {
      const currentSaved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (!currentSaved || currentSaved === "system") {
        const newResolved = computeTheme("system");
        setResolvedTheme(newResolved);
        if (newResolved === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [computeTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    const resolved = computeTheme(newTheme);
    setResolvedTheme(resolved);

    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    // Graceful fallback for components rendered outside provider
    return {
      theme: "light" as Theme,
      resolvedTheme: "light" as const,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
