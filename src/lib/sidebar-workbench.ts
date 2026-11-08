export interface WorkbenchTool {
  id: string;
  title: string;
  defaultTitle: string;
  href: string;
  iconName: string;
  badge?: number;
  description?: string;
}

export interface WorkbenchConfig {
  core: WorkbenchTool[];
  more: WorkbenchTool[];
  vault: WorkbenchTool[];
}

export const DEFAULT_WORKBENCH: WorkbenchConfig = {
  core: [
    {
      id: "dashboard",
      title: "Dashboard",
      defaultTitle: "Dashboard",
      href: "/",
      iconName: "LayoutDashboard",
      description: "Daily intention, agenda & metrics overview",
    },
    {
      id: "tasks",
      title: "Tasks",
      defaultTitle: "Tasks",
      href: "/tasks",
      iconName: "CheckSquare",
      badge: 12,
      description: "Sprint task manager & priority queues",
    },
    {
      id: "calendar",
      title: "Calendar",
      defaultTitle: "Calendar",
      href: "/calendar",
      iconName: "Calendar",
      description: "Time-blocking, schedule & meeting timeline",
    },
    {
      id: "inbox",
      title: "Inbox",
      defaultTitle: "Inbox",
      href: "/inbox",
      iconName: "Inbox",
      badge: 3,
      description: "Frictionless capture & triage workstation",
    },
    {
      id: "focus",
      title: "Focus Mode",
      defaultTitle: "Focus Mode",
      href: "/focus",
      iconName: "Timer",
      description: "Pomodoro & thinking orbs deep-work workstation",
    },
    {
      id: "projects",
      title: "Projects",
      defaultTitle: "Projects",
      href: "/projects",
      iconName: "FolderKanban",
      description: "Active initiatives (NBD, ACoV, Fossil, Friday)",
    },
    {
      id: "studio",
      title: "Social Studio",
      defaultTitle: "Social Studio",
      href: "/studio",
      iconName: "Share2",
      description: "Multi-platform publication & content drafting",
    },
  ],
  more: [
    {
      id: "notes",
      title: "Notes",
      defaultTitle: "Notes",
      href: "/notes",
      iconName: "FileText",
      description: "Markdown knowledge base & wiki-link graph",
    },
    {
      id: "radar",
      title: "The Radar",
      defaultTitle: "The Radar",
      href: "/radar",
      iconName: "Radio",
      description: "Curated RSS feeds & 1-click signal promotion",
    },
    {
      id: "habits",
      title: "Habits",
      defaultTitle: "Habits",
      href: "/habits",
      iconName: "Flame",
      description: "Daily streaks & consistency tracking",
    },
    {
      id: "journal",
      title: "Journal",
      defaultTitle: "Journal",
      href: "/journal",
      iconName: "BookOpen",
      description: "Reflective journaling & mood trajectory",
    },
    {
      id: "settings",
      title: "Settings",
      defaultTitle: "Settings",
      href: "/settings",
      iconName: "Settings",
      description: "Single-user enclave controls & data seeding",
    },
  ],
  vault: [],
};

const STORAGE_KEY = "personal-os:sidebar-workbench";
export const WORKBENCH_CHANGE_EVENT = "personal-os:workbench-changed";

export function loadWorkbenchConfig(): WorkbenchConfig {
  if (typeof window === "undefined") {
    return DEFAULT_WORKBENCH;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORKBENCH;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.core) && Array.isArray(parsed.more)) {
      return {
        core: parsed.core,
        more: parsed.more,
        vault: Array.isArray(parsed.vault) ? parsed.vault : [],
      };
    }
  } catch {
    // Return fallback on parse error
  }
  return DEFAULT_WORKBENCH;
}

export function saveWorkbenchConfig(config: WorkbenchConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(WORKBENCH_CHANGE_EVENT, { detail: config }));
  } catch {
    // Storage quota or error
  }
}

export function resetWorkbenchConfig(): WorkbenchConfig {
  saveWorkbenchConfig(DEFAULT_WORKBENCH);
  return DEFAULT_WORKBENCH;
}
