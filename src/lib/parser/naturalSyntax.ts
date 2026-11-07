import { getLocalDateIso, getPastLocalDateIso } from "@/lib/utils";

export interface ParsedNaturalSyntax {
  raw: string;
  title: string;
  projectName?: string;
  date?: string; // YYYY-MM-DD
  priority?: "urgent" | "high" | "medium" | "low";
  estimatedMinutes?: number;
  tags: string[];
}

/**
 * Calculates a future YYYY-MM-DD date based on day name (e.g. "monday", "friday")
 */
function getNextDayOfWeekIso(dayName: string): string {
  const daysMap: Record<string, number> = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };

  const targetDay = daysMap[dayName.toLowerCase()];
  if (targetDay === undefined) return getLocalDateIso();

  const now = new Date();
  const currentDay = now.getDay();
  let diff = targetDay - currentDay;
  if (diff <= 0) {
    diff += 7; // Next occurrence
  }

  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseNaturalSyntax(input: string): ParsedNaturalSyntax {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      raw: "",
      title: "",
      tags: [],
    };
  }

  let text = trimmed;
  let projectName: string | undefined;
  let date: string | undefined;
  let priority: "urgent" | "high" | "medium" | "low" | undefined;
  let estimatedMinutes: number | undefined;
  const tags: string[] = [];

  // 1. Extract Project: #project-name or #project
  const projectRegex = /(?:^|\s)#([a-zA-Z0-9_\-]+)/g;
  const projectMatches = [...text.matchAll(projectRegex)];
  if (projectMatches.length > 0) {
    projectName = projectMatches[0][1];
    text = text.replace(projectMatches[0][0], " ");
  }

  // 2. Extract Priority: p:high, p:urgent, p:medium, p:low, or !urgent, !high
  const priorityRegex = /(?:^|\s)(?:p:(urgent|high|medium|low)|!(urgent|high|medium|low))\b/i;
  const prioMatch = text.match(priorityRegex);
  if (prioMatch) {
    const matchedVal = (prioMatch[1] || prioMatch[2]).toLowerCase() as
      | "urgent"
      | "high"
      | "medium"
      | "low";
    priority = matchedVal;
    text = text.replace(prioMatch[0], " ");
  }

  // 3. Extract Schedule Date: !today, !tomorrow, !monday, !2026-11-15
  const dateRegex =
    /(?:^|\s)!(today|tomorrow|yesterday|sun|mon|tue|wed|thu|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday|\d{4}-\d{2}-\d{2})\b/i;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    const rawDate = dateMatch[1].toLowerCase();
    if (rawDate === "today") {
      date = getLocalDateIso();
    } else if (rawDate === "tomorrow") {
      const now = new Date();
      const tmrw = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const y = tmrw.getFullYear();
      const m = String(tmrw.getMonth() + 1).padStart(2, "0");
      const d = String(tmrw.getDate()).padStart(2, "0");
      date = `${y}-${m}-${d}`;
    } else if (rawDate === "yesterday") {
      date = getPastLocalDateIso(getLocalDateIso(), 1);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      date = rawDate;
    } else {
      date = getNextDayOfWeekIso(rawDate);
    }
    text = text.replace(dateMatch[0], " ");
  }

  // 4. Extract Duration: @30m, @1h, @45min, @1.5h
  const durationRegex = /(?:^|\s)@(\d+(?:\.\d+)?)(m|min|h|hr|hours?)\b/i;
  const durationMatch = text.match(durationRegex);
  if (durationMatch) {
    const num = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith("h")) {
      estimatedMinutes = Math.round(num * 60);
    } else {
      estimatedMinutes = Math.round(num);
    }
    text = text.replace(durationMatch[0], " ");
  }

  // 5. Extract Tags: +tag or t:tag
  const tagRegex = /(?:^|\s)(?:\+|t:)([a-zA-Z0-9_\-]+)/g;
  const tagMatches = [...text.matchAll(tagRegex)];
  for (const tm of tagMatches) {
    tags.push(tm[1].toLowerCase());
    text = text.replace(tm[0], " ");
  }

  // Clean extra spaces from title
  const cleanTitle = text.replace(/\s+/g, " ").trim();

  return {
    raw: trimmed,
    title: cleanTitle || trimmed,
    projectName,
    date,
    priority,
    estimatedMinutes,
    tags,
  };
}
