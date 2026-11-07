import { describe, it, expect } from "vitest";
import { parseNaturalSyntax } from "./naturalSyntax";
import { parseBatchIngest } from "./batchIngest";
import { getLocalDateIso } from "@/lib/utils";

describe("parseNaturalSyntax", () => {
  it("parses plain title when no tokens provided", () => {
    const res = parseNaturalSyntax("Buy groceries from farmer market");
    expect(res.title).toBe("Buy groceries from farmer market");
    expect(res.projectName).toBeUndefined();
    expect(res.priority).toBeUndefined();
    expect(res.date).toBeUndefined();
    expect(res.estimatedMinutes).toBeUndefined();
  });

  it("extracts #project, p:priority, !date, and @duration tokens", () => {
    const res = parseNaturalSyntax(
      "Draft Supabase migration #infra p:high !today @45m"
    );
    expect(res.title).toBe("Draft Supabase migration");
    expect(res.projectName).toBe("infra");
    expect(res.priority).toBe("high");
    expect(res.date).toBe(getLocalDateIso());
    expect(res.estimatedMinutes).toBe(45);
  });

  it("extracts hour durations into minutes (@1.5h -> 90m)", () => {
    const res = parseNaturalSyntax("Deep work coding block @1.5h");
    expect(res.title).toBe("Deep work coding block");
    expect(res.estimatedMinutes).toBe(90);
  });

  it("parses !tomorrow and tags (+backend)", () => {
    const res = parseNaturalSyntax("Deploy production release !tomorrow +backend +ops");
    expect(res.title).toBe("Deploy production release");
    expect(res.tags).toEqual(["backend", "ops"]);
    expect(res.date).toBeDefined();
    // Tomorrow date should be different from today
    expect(res.date).not.toBe(getLocalDateIso());
  });

  it("extracts !urgent shortcut for priority", () => {
    const res = parseNaturalSyntax("Emergency database rollback !urgent");
    expect(res.title).toBe("Emergency database rollback");
    expect(res.priority).toBe("urgent");
  });
});

describe("parseBatchIngest", () => {
  it("parses multi-line bullet lists and markdown checkboxes", () => {
    const raw = `
- [ ] Review auth PR #dev p:high !today
- [x] Send invoice to client @15m
* Write weekly team retro #management
1. Buy fresh espresso beans
`;
    const items = parseBatchIngest(raw);
    expect(items).toHaveLength(4);

    expect(items[0].title).toBe("Review auth PR");
    expect(items[0].projectName).toBe("dev");
    expect(items[0].priority).toBe("high");
    expect(items[0].isCompleted).toBe(false);

    expect(items[1].title).toBe("Send invoice to client");
    expect(items[1].estimatedMinutes).toBe(15);
    expect(items[1].isCompleted).toBe(true);

    expect(items[2].title).toBe("Write weekly team retro");
    expect(items[2].projectName).toBe("management");

    expect(items[3].title).toBe("Buy fresh espresso beans");
  });

  it("ignores empty whitespace lines", () => {
    const raw = `
    
    - [ ] Task 1
    
    - [ ] Task 2
    
    `;
    const items = parseBatchIngest(raw);
    expect(items).toHaveLength(2);
  });
});
