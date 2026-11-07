import { parseNaturalSyntax, ParsedNaturalSyntax } from "./naturalSyntax";

export interface BatchIngestItem extends ParsedNaturalSyntax {
  id: string;
  sourceLineNumber: number;
  isCompleted?: boolean;
}

export function parseBatchIngest(text: string): BatchIngestItem[] {
  if (!text || !text.trim()) return [];

  const lines = text.split(/\r?\n/);
  const items: BatchIngestItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Check if line is a markdown checkbox: - [ ] or - [x] or * [ ]
    let cleanLine = rawLine;
    let isCompleted = false;

    const checkboxMatch = cleanLine.match(/^[-*]\s*\[([ xX])\]\s*(.*)$/);
    if (checkboxMatch) {
      isCompleted = checkboxMatch[1].toLowerCase() === "x";
      cleanLine = checkboxMatch[2];
    } else {
      // Strip leading bullet or number: - item, * item, 1. item
      cleanLine = cleanLine.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "");
    }

    if (!cleanLine.trim()) continue;

    const parsed = parseNaturalSyntax(cleanLine);
    if (!parsed.title) continue;

    items.push({
      ...parsed,
      id: `item-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      sourceLineNumber: i + 1,
      isCompleted,
    });
  }

  return items;
}
