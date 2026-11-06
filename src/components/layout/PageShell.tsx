import * as React from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title?: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn("app-content page-stack pb-20 lg:pb-12", className)}>
      {(title || eyebrow || actions) && (
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[var(--border)]">
          <div className="flex flex-col space-y-1">
            {eyebrow && (
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="font-serif font-medium text-2xl sm:text-3xl text-[var(--foreground)] tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-[var(--muted-foreground)] max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
        </header>
      )}

      <main className="w-full">{children}</main>
    </div>
  );
}
