import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-sm font-medium transition-colors duration-[var(--motion-fast)] ease-[var(--motion-ease)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-105 active:brightness-95 shadow-sm":
              variant === "default",
            "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)] active:opacity-90":
              variant === "secondary",
            "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]":
              variant === "outline",
            "text-[var(--foreground)] hover:bg-[var(--secondary)] active:bg-[var(--muted)]":
              variant === "ghost",
            "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:brightness-110 active:brightness-90":
              variant === "destructive",
            "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95":
              variant === "accent",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
