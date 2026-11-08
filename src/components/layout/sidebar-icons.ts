import * as React from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Inbox,
  Timer,
  FolderKanban,
  Share2,
  FileText,
  Radio,
  Flame,
  BookOpen,
  Settings,
  Sliders,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";

export const SIDEBAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Inbox,
  Timer,
  FolderKanban,
  Share2,
  FileText,
  Radio,
  Flame,
  BookOpen,
  Settings,
  Sliders,
  Sparkles,
  Layers,
};

export function getSidebarIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return SIDEBAR_ICONS[iconName] || HelpCircle;
}
