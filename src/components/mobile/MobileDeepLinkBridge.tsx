"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { initMobileNotifications } from "@/lib/notifications/mobileNotifications";
import { toast } from "sonner";

/**
 * Mobile Deep Link & Android System Bridge.
 * Handles:
 * 1. Deep linking (`personalos://...`) from widgets & quick settings.
 * 2. System share sheet imports (`ACTION_SEND` text forwarded via `personalos://capture?shared_text=...`).
 * 3. Android hardware back gesture / back button routing.
 * 4. Local notification channels initialization.
 */
export function MobileDeepLinkBridge() {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Initialize exact alarm notification channels on launch
    initMobileNotifications();

    // 2. Handle deep links from Widget, QS Tile, or Share Sheet
    const urlListener = CapApp.addListener("appUrlOpen", (data) => {
      try {
        const rawUrl = data.url;
        if (!rawUrl) return;

        // Parse custom scheme URI: personalos://<authority>/<path>?<query>
        // Note: URL constructor requires standard protocol; replace personalos:// with https://temp.app/
        const parsed = new URL(rawUrl.replace(/^personalos:\/\//, "https://personalos.internal/"));
        const host = parsed.hostname; // e.g. "capture", "dashboard", "focus", "tasks"
        const params = parsed.searchParams;

        if (host === "capture") {
          const sharedText = params.get("shared_text");
          const isVoice = params.get("voice") === "true";

          if (sharedText) {
            window.dispatchEvent(
              new CustomEvent("personal-os:quick-capture", {
                detail: { text: sharedText },
              })
            );
            toast.success("Captured from Android Share", {
              description: sharedText.slice(0, 60) + (sharedText.length > 60 ? "…" : ""),
            });
          } else {
            window.dispatchEvent(
              new CustomEvent("personal-os:quick-capture", {
                detail: { voice: isVoice },
              })
            );
          }
        } else if (host === "dashboard" || host === "") {
          router.push("/");
        } else if (host === "focus") {
          router.push("/focus");
        } else if (host === "tasks") {
          router.push("/tasks");
        } else if (host === "leads") {
          router.push("/leads");
        } else if (host === "radar") {
          router.push("/radar");
        }
      } catch (err) {
        console.warn("Could not process incoming app URL:", data.url, err);
      }
    });

    // 3. Android Hardware Back Button / Swipe Gesture
    const backListener = CapApp.addListener("backButton", ({ canGoBack }) => {
      // Check if any open dialog or modal exists
      const openDialog = document.querySelector('[role="dialog"][data-state="open"]');
      if (openDialog) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        return;
      }

      // Check if not on dashboard root, navigate back
      if (pathname !== "/" && canGoBack) {
        router.back();
      } else {
        // At dashboard root: minimize app smoothly rather than killing process
        CapApp.minimizeApp();
      }
    });

    return () => {
      urlListener.then((handle) => handle.remove());
      backListener.then((handle) => handle.remove());
    };
  }, [router, pathname]);

  return null;
}
