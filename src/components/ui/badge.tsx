import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "accent" | "outline" | "success" | "warning" | "destructive";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-[var(--primary)] text-[var(--primary-foreground)]": variant === "default",
          "bg-[var(--secondary)] text-[var(--secondary-foreground)]": variant === "secondary",
          "bg-[var(--accent)] text-[var(--accent-foreground)]": variant === "accent",
          "border border-[var(--border)] text-[var(--foreground)]": variant === "outline",
          "bg-[#eaf4ed] text-[var(--success)]": variant === "success",
          "bg-[#fdf3e7] text-[var(--warning)]": variant === "warning",
          "bg-[#fdeeed] text-[var(--destructive)]": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}
