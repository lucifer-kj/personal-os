"use client";

import * as React from "react";

export type LogoVariant = "light" | "dark" | "auto";
export type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize | number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

const sizeMap: Record<LogoSize, number> = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

export function Logo({
  variant = "auto",
  size = "md",
  showText = false,
  subtitle = "Arif's Sanctuary",
  className = "",
}: LogoProps) {
  const pixelSize = typeof size === "number" ? size : sizeMap[size];

  const darkContent = (
    /* Dark Version — Luminous Glowing Ember Sphere */
    <g className={variant === "auto" ? "hidden dark:block" : ""}>
      {/* Ambient Outer Halo */}
      <circle cx="32" cy="32" r="30" fill="url(#logo-dark-glow)" />

      {/* Deep Obsidian Core */}
      <circle cx="32" cy="32" r="26" fill="#140E0B" stroke="#381D12" strokeWidth="1.5" />

      {/* Glowing Orbital Crest */}
      <path
        d="M 14 34 C 15 20, 26 12, 40 13 C 50 14, 55 24, 52 34 C 48 46, 34 52, 22 49 C 16 46, 13 41, 14 34 Z"
        fill="url(#logo-dark-orbit)"
        opacity="0.9"
      />

      {/* Inner Swirl Stream */}
      <path
        d="M 22 26 C 26 18, 42 18, 46 26 C 49 32, 44 42, 34 43 C 27 44, 21 38, 22 26 Z"
        fill="#FFA05C"
        opacity="0.85"
      />

      {/* Center Luminous Core Star */}
      <circle cx="33" cy="31" r="3" fill="#FFF9F5" />
      <circle cx="33" cy="31" r="6" fill="#FFF4ED" opacity="0.4" />
    </g>
  );

  const lightContent = (
    /* Light Version — Warm Editorial Swirl Emblem */
    <g className={variant === "auto" ? "block dark:hidden" : ""}>
      {/* Outer Border Rim */}
      <circle cx="32" cy="32" r="29" fill="url(#logo-light-base)" stroke="#E8DDD2" strokeWidth="1.5" />

      {/* Primary Terracotta Crescent Shape */}
      <path
        d="M 16 33 C 16 21, 26 14, 39 15 C 49 16, 53 24, 51 33 C 48 44, 36 50, 24 47 C 18 44, 15 40, 16 33 Z"
        fill="url(#logo-light-terracotta)"
      />

      {/* Inner Warm Highlight Swirl */}
      <path
        d="M 24 28 C 27 21, 39 21, 43 28 C 45 33, 40 40, 33 41 C 28 42, 23 37, 24 28 Z"
        fill="#FFF1E8"
        opacity="0.92"
      />

      {/* Focal Amber Dot */}
      <circle cx="33.5" cy="31.5" r="3" fill="#B94A24" />
    </g>
  );

  // SVG Emblem
  const emblem = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
    >
      <defs>
        {/* Light Variant Gradients */}
        <linearGradient id="logo-light-base" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF4ED" />
          <stop offset="100%" stopColor="#F5E4D7" />
        </linearGradient>
        <linearGradient id="logo-light-terracotta" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D85C30" />
          <stop offset="50%" stopColor="#B94A24" />
          <stop offset="100%" stopColor="#963514" />
        </linearGradient>

        {/* Dark Variant Gradients */}
        <radialGradient id="logo-dark-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF8B3D" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#E05B27" stopOpacity="0.8" />
          <stop offset="80%" stopColor="#A83812" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1A110C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="logo-dark-orbit" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFA666" />
          <stop offset="50%" stopColor="#E05B27" />
          <stop offset="100%" stopColor="#7E2407" />
        </linearGradient>
      </defs>

      {variant === "dark" && darkContent}
      {variant === "light" && lightContent}
      {variant === "auto" && (
        <>
          {lightContent}
          {darkContent}
        </>
      )}
    </svg>
  );

  if (!showText) {
    return <div className={`inline-flex items-center ${className}`}>{emblem}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {emblem}
      <div className="flex flex-col">
        <span className="font-serif font-medium text-base text-[var(--foreground)] tracking-tight leading-none">
          Personal OS
        </span>
        {subtitle && (
          <span className="text-[10px] text-[#A84A28] dark:text-[#E07A50] font-sans tracking-wide mt-1">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
