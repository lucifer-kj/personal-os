"use client";

import * as React from "react";
import Image from "next/image";

export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

interface DynamicSceneryProps {
  className?: string;
  forceTimeOfDay?: TimeOfDay;
}

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "dawn"; // 5 AM - 10:59 AM
  if (hour >= 11 && hour < 17) return "day";  // 11 AM - 4:59 PM
  if (hour >= 17 && hour < 21) return "dusk"; // 5 PM - 8:59 PM
  return "night";                             // 9 PM - 4:59 AM
}

export function DynamicScenery({ className = "", forceTimeOfDay }: DynamicSceneryProps) {
  const [detectedTimeOfDay, setDetectedTimeOfDay] = React.useState<TimeOfDay>(() => getTimeOfDay());

  React.useEffect(() => {
    if (forceTimeOfDay) return;

    const interval = setInterval(() => {
      setDetectedTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, [forceTimeOfDay]);

  const activeTimeOfDay: TimeOfDay = forceTimeOfDay ?? detectedTimeOfDay;

  const times: TimeOfDay[] = ["dawn", "day", "dusk", "night"];
  const sceneryMap: Record<TimeOfDay, string> = {
    dawn: "/scenery/dawn.svg",
    day: "/scenery/day.svg",
    dusk: "/scenery/dusk.svg",
    night: "/scenery/night.svg",
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {times.map((t) => (
        <div
          key={t}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            activeTimeOfDay === t ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={sceneryMap[t]}
            alt=""
            fill
            priority={t === activeTimeOfDay}
            className="object-cover object-top opacity-60 dark:opacity-40"
            sizes="100vw"
          />
        </div>
      ))}
      {/* Soft gradient bottom blend */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
    </div>
  );
}
