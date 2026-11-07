export type SearchResultType =
  | "task"
  | "project"
  | "note"
  | "habit"
  | "inbox"
  | "navigation"
  | "action";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  snippet?: string;
  url: string;
  status?: string;
  category?: string;
  metadata?: Record<string, unknown>;
  score?: number;
}

export interface SearchQuery {
  q: string;
  types?: SearchResultType[];
  limit?: number;
}

export interface NavigationCommand {
  id: string;
  title: string;
  category: string;
  url: string;
  keywords: string[];
  shortcut?: string;
}

export interface QuickActionCommand {
  id: string;
  title: string;
  description: string;
  actionId: string;
  url?: string;
  keywords: string[];
  shortcut?: string;
}
