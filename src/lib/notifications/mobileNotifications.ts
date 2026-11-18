import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Haptics, NotificationType } from "@capacitor/haptics";

export const FOCUS_NOTIFICATION_ID = 1001;
export const FOCUS_CHANNEL_ID = "personal_os_focus";

/**
 * Initializes native Android notification channels on first run.
 * Configured with maximum importance and terracotta accent for POCO C61 / HyperOS.
 */
export async function initMobileNotifications(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== "granted") {
      const request = await LocalNotifications.requestPermissions();
      if (request.display !== "granted") {
        return false;
      }
    }

    // High-priority channel for exact focus timer alarms
    await LocalNotifications.createChannel({
      id: FOCUS_CHANNEL_ID,
      name: "Focus Timer Alarms",
      description: "Server-authoritative focus timer completions and rest cycle alarms",
      importance: 5, // IMPORTANCE_HIGH (pops down heads-up on Android)
      visibility: 1, // VISIBILITY_PUBLIC
      vibration: true,
      lights: true,
      lightColor: "#C96442",
    });

    return true;
  } catch (error) {
    console.warn("Failed to initialize mobile notification channels:", error);
    return false;
  }
}

/**
 * Schedules an exact alarm notification when a focus block finishes.
 * Android 14 / HyperOS will wake up and alert the user even when the WebView is frozen.
 */
export async function scheduleFocusNotification(
  remainingSeconds: number,
  title = "Focus Block Complete",
  body = "Your focus sprint is complete. Take a breath and log your progress."
): Promise<void> {
  if (remainingSeconds <= 0) return;

  if (Capacitor.isNativePlatform()) {
    try {
      // Clear any prior focus alarm before setting the new exact timestamp
      await LocalNotifications.cancel({ notifications: [{ id: FOCUS_NOTIFICATION_ID }] });

      const targetDate = new Date(Date.now() + remainingSeconds * 1000);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: FOCUS_NOTIFICATION_ID,
            title,
            body,
            schedule: {
              at: targetDate,
              allowWhileIdle: true,
            },
            channelId: FOCUS_CHANNEL_ID,
            smallIcon: "ic_launcher_foreground",
            iconColor: "#C96442",
            isExactNotification: true,
            isExactMandatory: false,
          },
        ],
      });
    } catch (err) {
      console.warn("Could not schedule native exact focus notification:", err);
    }
  } else if (typeof window !== "undefined" && "Notification" in window) {
    // Web desktop fallback
    if (Notification.permission === "granted") {
      // In web, browser setTimeout will trigger if tab is open
    }
  }
}

/**
 * Cancels any active or pending focus alarm (called when paused or abandoned).
 */
export async function cancelFocusNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.cancel({ notifications: [{ id: FOCUS_NOTIFICATION_ID }] });
  } catch (err) {
    console.warn("Error cancelling focus notification:", err);
  }
}

/**
 * Triggers completion haptic burst and notification sound.
 */
export async function notifyFocusSessionComplete(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      // Ignore if haptics unsupported
    }
  }
}
