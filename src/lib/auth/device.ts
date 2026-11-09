/**
 * Device and User-Agent parser for Personal OS Session Management
 */

export interface DeviceInfo {
  deviceName: string;
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet" | "workstation";
}

/**
 * Extracts browser name and version from a User-Agent string.
 */
export function getBrowserName(ua: string): string {
  if (!ua) return "Unknown Browser";
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Chrome/") && !ua.includes("Chromium/")) return "Google Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Apple Safari";
  if (ua.includes("Firefox/")) return "Mozilla Firefox";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  return "Web Browser";
}

/**
 * Extracts Operating System name from a User-Agent string.
 */
export function getOsName(ua: string): string {
  if (!ua) return "Unknown OS";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Windows NT 10.0") || ua.includes("Windows")) return "Windows";
  if (ua.includes("Macintosh") || ua.includes("Mac OS X")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unknown OS";
}

/**
 * Categorizes device type.
 */
export function getDeviceType(ua: string): "desktop" | "mobile" | "tablet" | "workstation" {
  if (!ua) return "workstation";
  if (ua.includes("iPad") || ua.includes("Tablet")) return "tablet";
  if (ua.includes("iPhone") || ua.includes("Android") || ua.includes("Mobile")) return "mobile";
  return "desktop";
}

/**
 * Combines parsed attributes into a friendly device description.
 */
export function parseUserAgent(ua: string): DeviceInfo {
  const browser = getBrowserName(ua);
  const os = getOsName(ua);
  const deviceType = getDeviceType(ua);

  let deviceName = `${os} Workstation`;
  if (deviceType === "mobile") {
    deviceName = `${os} Phone`;
  } else if (deviceType === "tablet") {
    deviceName = `${os} Tablet`;
  }

  return {
    deviceName,
    browser,
    os,
    deviceType,
  };
}
