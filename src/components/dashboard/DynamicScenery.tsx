"use client";

import * as React from "react";
import Image from "next/image";

export type TimeOfDay = "dawn" | "day" | "dusk" | "evening" | "night";

interface DynamicSceneryProps {
  className?: string;
  forceTimeOfDay?: TimeOfDay;
}

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 9) return "dawn";       // 5:00 AM - 8:59 AM (Golden Sunrise)
  if (hour >= 9 && hour < 17) return "day";       // 9:00 AM - 4:59 PM (Sunlit Valleys)
  if (hour >= 17 && hour < 19) return "dusk";     // 5:00 PM - 6:59 PM (Sunset Panorama)
  if (hour >= 19 && hour < 22) return "evening";  // 7:00 PM - 9:59 PM (Golden Sunset)
  return "night";                                 // 10:00 PM - 4:59 AM (Moonlit Milky Way)
}

interface SceneryAsset {
  image: string;
  fallback: string;
  alt: string;
}

const sceneryMap: Record<TimeOfDay, SceneryAsset> = {
  dawn: {
    image: "/scenery/Golden%20Sunrise%20Over%20Misty%20Mountains.png",
    fallback: "/scenery/dawn.svg",
    alt: "Golden sunrise over misty mountain ridges",
  },
  day: {
    image: "/scenery/Sunlit%20Mountain%20Valleys%20Beneath%20Soft%20Clouds.png",
    fallback: "/scenery/day.svg",
    alt: "Sunlit mountain valleys beneath soft clouds",
  },
  dusk: {
    image: "/scenery/Misty%20Mountain%20Sunset%20Panorama.png",
    fallback: "/scenery/dusk.svg",
    alt: "Misty mountain sunset panorama",
  },
  evening: {
    image: "/scenery/Golden%20Sunset%20Over%20Mountain%20Ridges.png",
    fallback: "/scenery/dusk.svg",
    alt: "Golden sunset over mountain ridges",
  },
  night: {
    image: "/scenery/Moonlit%20Milky%20Way%20Over%20Misty%20Mountains.png",
    fallback: "/scenery/night.svg",
    alt: "Moonlit Milky Way over misty mountains",
  },
};

export function DynamicScenery({ className = "", forceTimeOfDay }: DynamicSceneryProps) {
  const [detectedTimeOfDay, setDetectedTimeOfDay] = React.useState<TimeOfDay>(() => getTimeOfDay());
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (forceTimeOfDay) return;

    const interval = setInterval(() => {
      setDetectedTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, [forceTimeOfDay]);

  const activeTimeOfDay: TimeOfDay = forceTimeOfDay ?? detectedTimeOfDay;
  const currentAsset = sceneryMap[activeTimeOfDay] || sceneryMap.dawn;
  const imageSrc = failedImages[activeTimeOfDay] ? currentAsset.fallback : currentAsset.image;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base High-Resolution Landscape Layer */}
      <div className="absolute inset-0 transform-gpu transition-opacity duration-1000 ease-out">
        <Image
          src={imageSrc}
          alt={currentAsset.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-75 dark:opacity-45 scale-[1.02] filter contrast-[1.05] brightness-[0.95]"
          onError={() => {
            setFailedImages((prev) => ({ ...prev, [activeTimeOfDay]: true }));
          }}
        />
      </div>

      {/* 2. Readability Gradient Layer (Atmospheric Darkening & Depth Blend) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[var(--background)] transition-colors duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent" />
    </div>
  );
}
