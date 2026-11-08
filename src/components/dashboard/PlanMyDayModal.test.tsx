import { describe, it, expect } from "vitest";
import { parseDocketLine } from "./PlanMyDayModal";

describe("parseDocketLine natural syntax engine", () => {
  it("correctly parses multi-token task line with project, priority, duration, time and tag", () => {
    const line = "Architecture review @NBD !urgent ~45m ^10:00 #sprint // deliver spec";
    const parsed = parseDocketLine(line);

    expect(parsed).not.toBeNull();
    expect(parsed?.title).toBe("Architecture review");
    expect(parsed?.projectName).toBe("NBD");
    expect(parsed?.priority).toBe("urgent");
    expect(parsed?.estimatedMinutes).toBe(45);
    expect(parsed?.scheduledTime).toBe("10:00");
    expect(parsed?.tags).toContain("sprint");
    expect(parsed?.notes).toBe("deliver spec");
  });

  it("handles hours in duration estimates (~1h -> 60m)", () => {
    const line = "Deep focus coding @ACoV !high ~1h";
    const parsed = parseDocketLine(line);

    expect(parsed?.title).toBe("Deep focus coding");
    expect(parsed?.projectName).toBe("ACoV");
    expect(parsed?.priority).toBe("high");
    expect(parsed?.estimatedMinutes).toBe(60);
  });

  it("ignores comment-only lines starting with //", () => {
    const line = "// This is just a note or separator";
    const parsed = parseDocketLine(line);
    expect(parsed).toBeNull();
  });

  it("handles simple lines without metadata", () => {
    const line = "Buy coffee beans";
    const parsed = parseDocketLine(line);

    expect(parsed?.title).toBe("Buy coffee beans");
    expect(parsed?.priority).toBeUndefined();
    expect(parsed?.projectName).toBeUndefined();
  });
});
