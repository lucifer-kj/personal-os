import { z } from "zod";

export const SearchResultTypeEnum = z.enum([
  "task",
  "project",
  "note",
  "habit",
  "inbox",
  "navigation",
  "action",
]);

export const SearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query must be at most 100 characters"),
  types: z
    .preprocess((val) => {
      if (typeof val === "string") {
        return val.split(",").map((s) => s.trim());
      }
      return val;
    }, z.array(SearchResultTypeEnum).optional()),
  limit: z
    .preprocess((val) => {
      if (typeof val === "string") {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    }, z.number().int().min(1).max(50).optional().default(20)),
});

export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
