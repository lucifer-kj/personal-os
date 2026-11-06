"use client";

import * as React from "react";
import Image from "next/image";
import { ThinkingOrb } from "thinking-orbs";

export type OrbState =
  | "working"
  | "searching"
  | "solving"
  | "listening"
  | "composing"
  | "shaping"
  | "connecting"
  | "weaving"
  | "breathing";

interface AppOrbProps {
  size?: 20 | 64 | number;
  state?: OrbState;
  interactive?: boolean;
  className?: string;
  useFallbackLogo?: boolean;
}

const emptySubscribe = () => () => {};
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function AppOrb({
  size = 64,
  state = "breathing",
  interactive = false,
  className = "",
  useFallbackLogo = false,
}: AppOrbProps) {
  const mounted = useMounted();

  if (useFallbackLogo || !mounted) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="Personal OS Orb"
          width={size}
          height={size}
          className="object-cover"
          priority
        />
      </div>
    );
  }

  // ThinkingOrb component from Jakubantalik/thinking-orbs library
  // Supports size 20 or 64 natively
  const orbSize = size <= 32 ? 20 : 64;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${
        interactive ? "cursor-pointer hover:scale-105 transition-transform" : ""
      } ${className}`}
      style={{ width: size, height: size }}
      title={`Orb status: ${state}`}
    >
      <ThinkingOrb state={state} size={orbSize} />
    </div>
  );
}
