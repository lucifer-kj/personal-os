import { describe, it, expect } from "vitest";
import { getBrowserName, getOsName, getDeviceType, parseUserAgent } from "./device";

describe("Device and User-Agent parser", () => {
  it("parses Windows and Chrome correctly", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const info = parseUserAgent(ua);
    expect(info.os).toBe("Windows");
    expect(info.browser).toBe("Google Chrome");
    expect(info.deviceType).toBe("desktop");
    expect(info.deviceName).toBe("Windows Workstation");
  });

  it("parses macOS and Safari correctly", () => {
    const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
    const info = parseUserAgent(ua);
    expect(info.os).toBe("macOS");
    expect(info.browser).toBe("Apple Safari");
    expect(info.deviceType).toBe("desktop");
    expect(info.deviceName).toBe("macOS Workstation");
  });

  it("parses iPhone correctly", () => {
    const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    const info = parseUserAgent(ua);
    expect(info.os).toBe("iOS");
    expect(info.browser).toBe("Apple Safari");
    expect(info.deviceType).toBe("mobile");
    expect(info.deviceName).toBe("iOS Phone");
  });

  it("handles empty or unknown user agent gracefully", () => {
    const info = parseUserAgent("");
    expect(info.os).toBe("Unknown OS");
    expect(info.browser).toBe("Unknown Browser");
    expect(info.deviceType).toBe("workstation");
  });
});
