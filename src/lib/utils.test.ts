import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("base-class", "additional-class")).toBe("base-class additional-class");
  });

  it("handles conditional classes and falsy values", () => {
    expect(cn("base-class", false && "ignored", undefined, null, "active")).toBe(
      "base-class active"
    );
  });

  it("resolves Tailwind conflicts cleanly", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
