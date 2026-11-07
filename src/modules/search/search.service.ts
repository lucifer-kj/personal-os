import { ISearchRepository } from "./search.repository";
import {
  NavigationCommand,
  QuickActionCommand,
  SearchQuery,
  SearchResultItem,
} from "./types";

export const DEFAULT_NAVIGATION_COMMANDS: NavigationCommand[] = [
  {
    id: "nav-today",
    title: "Today Overview",
    category: "Navigation",
    url: "/",
    keywords: ["home", "dashboard", "overview", "today", "agenda"],
    shortcut: "G D",
  },
  {
    id: "nav-tasks",
    title: "Tasks",
    category: "Navigation",
    url: "/tasks",
    keywords: ["tasks", "todo", "actions", "backlog", "list"],
    shortcut: "G T",
  },
  {
    id: "nav-inbox",
    title: "Inbox",
    category: "Navigation",
    url: "/inbox",
    keywords: ["inbox", "capture", "triage", "unprocessed"],
    shortcut: "G I",
  },
  {
    id: "nav-projects",
    title: "Projects",
    category: "Navigation",
    url: "/projects",
    keywords: ["projects", "milestones", "initiatives", "roadmaps"],
    shortcut: "G P",
  },
  {
    id: "nav-calendar",
    title: "Calendar",
    category: "Navigation",
    url: "/calendar",
    keywords: ["calendar", "schedule", "events", "agenda", "time blocking"],
    shortcut: "G C",
  },
  {
    id: "nav-notes",
    title: "Notes & Knowledge",
    category: "Navigation",
    url: "/notes",
    keywords: ["notes", "docs", "knowledge", "wiki", "tags", "markdown"],
    shortcut: "G N",
  },
  {
    id: "nav-habits",
    title: "Habits",
    category: "Navigation",
    url: "/habits",
    keywords: ["habits", "streaks", "routines", "consistency"],
    shortcut: "G H",
  },
  {
    id: "nav-journal",
    title: "Journal & Reflections",
    category: "Navigation",
    url: "/journal",
    keywords: ["journal", "reflection", "mood", "daily log", "diary"],
    shortcut: "G J",
  },
  {
    id: "nav-focus",
    title: "Focus Session",
    category: "Navigation",
    url: "/focus",
    keywords: ["focus", "pomodoro", "timer", "stopwatch", "deep work"],
    shortcut: "G F",
  },
];

export const DEFAULT_QUICK_ACTIONS: QuickActionCommand[] = [
  {
    id: "act-quick-capture",
    title: "Quick Capture",
    description: "Capture thought, task, or note without switching contexts",
    actionId: "quick-capture",
    keywords: ["capture", "new", "inbox", "quick", "create", "draft"],
    shortcut: "C",
  },
  {
    id: "act-new-task",
    title: "Create Task",
    description: "Open task creation workflow in Tasks view",
    actionId: "new-task",
    url: "/tasks?new=true",
    keywords: ["new task", "create task", "add task", "todo"],
    shortcut: "N T",
  },
  {
    id: "act-new-note",
    title: "Create Note",
    description: "Open blank markdown note editor in Notes workstation",
    actionId: "new-note",
    url: "/notes?new=true",
    keywords: ["new note", "create note", "add note", "doc", "scratchpad"],
    shortcut: "N N",
  },
  {
    id: "act-start-focus",
    title: "Start Focus Session",
    description: "Begin 25-minute Pomodoro deep work block",
    actionId: "start-focus",
    url: "/focus?autoStart=true",
    keywords: ["start focus", "pomodoro", "timer", "deep work", "timer"],
    shortcut: "S F",
  },
  {
    id: "act-new-habit",
    title: "New Habit Routine",
    description: "Add a daily or weekly routine to track consistency streaks",
    actionId: "new-habit",
    url: "/habits?new=true",
    keywords: ["new habit", "track habit", "streak", "routine"],
    shortcut: "N H",
  },
  {
    id: "act-today-reflection",
    title: "Today's Reflection",
    description: "Record daily mood and evening reflection prompts",
    actionId: "today-reflection",
    url: "/journal",
    keywords: ["journal", "reflect", "mood", "today", "check-in"],
    shortcut: "J",
  },
];

export class SearchService {
  constructor(private searchRepo: ISearchRepository) {}

  getNavigationCommands(): NavigationCommand[] {
    return DEFAULT_NAVIGATION_COMMANDS;
  }

  getQuickActions(): QuickActionCommand[] {
    return DEFAULT_QUICK_ACTIONS;
  }

  filterNavigationCommands(query: string): NavigationCommand[] {
    const term = query.toLowerCase().trim();
    if (!term) return DEFAULT_NAVIGATION_COMMANDS;

    return DEFAULT_NAVIGATION_COMMANDS.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(term);
      const matchKeyword = cmd.keywords.some((k) => k.toLowerCase().includes(term));
      return matchTitle || matchKeyword;
    });
  }

  filterQuickActions(query: string): QuickActionCommand[] {
    const term = query.toLowerCase().trim();
    if (!term) return DEFAULT_QUICK_ACTIONS;

    return DEFAULT_QUICK_ACTIONS.filter((act) => {
      const matchTitle = act.title.toLowerCase().includes(term);
      const matchDesc = act.description.toLowerCase().includes(term);
      const matchKeyword = act.keywords.some((k) => k.toLowerCase().includes(term));
      return matchTitle || matchDesc || matchKeyword;
    });
  }

  async searchAll(
    userId: string,
    query: SearchQuery
  ): Promise<{
    results: SearchResultItem[];
    navigation: NavigationCommand[];
    actions: QuickActionCommand[];
  }> {
    const trimmed = query.q.trim();
    if (!trimmed) {
      return {
        results: [],
        navigation: this.getNavigationCommands(),
        actions: this.getQuickActions(),
      };
    }

    const [domainResults, matchingNav, matchingActions] = await Promise.all([
      this.searchRepo.search(userId, query),
      Promise.resolve(this.filterNavigationCommands(trimmed)),
      Promise.resolve(this.filterQuickActions(trimmed)),
    ]);

    return {
      results: domainResults,
      navigation: matchingNav,
      actions: matchingActions,
    };
  }
}
