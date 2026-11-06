"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckSquare,
  Plus,
  Trash2,
  Flag,
  Target,
} from "lucide-react";
import { ProjectWithStats, ProjectMilestone } from "@/modules/projects/types";
import { Task, CreateTaskDTO } from "@/modules/tasks/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskCreateDialog } from "@/components/tasks/TaskCreateDialog";
import { cn } from "@/lib/utils";

interface ProjectDetailViewProps {
  initialProject: ProjectWithStats;
  initialTasks?: Task[];
}

export function ProjectDetailView({
  initialProject,
  initialTasks = [],
}: ProjectDetailViewProps) {
  const [project, setProject] = React.useState<ProjectWithStats>(initialProject);
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [milestones, setMilestones] = React.useState<ProjectMilestone[]>(
    initialProject.milestones || []
  );

  // New Milestone Form
  const [isAddingMilestone, setIsAddingMilestone] = React.useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = React.useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = React.useState("");

  // New Task Dialog
  const [isCreateTaskOpen, setIsCreateTaskOpen] = React.useState(false);

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneId: string) => {
    const previous = [...milestones];
    setMilestones((current) =>
      current.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              status: m.status === "completed" ? "pending" : "completed",
              completed_at: m.status === "completed" ? null : new Date().toISOString(),
            }
          : m
      )
    );

    try {
      const res = await fetch(
        `/api/v1/projects/${project.id}/milestones/${milestoneId}`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed to toggle milestone");
      const json = await res.json();
      if (json.data) {
        setMilestones((current) =>
          current.map((m) => (m.id === milestoneId ? json.data : m))
        );
      }
    } catch {
      setMilestones(previous);
    }
  };

  // Delete milestone
  const handleDeleteMilestone = async (milestoneId: string) => {
    const previous = [...milestones];
    setMilestones((current) => current.filter((m) => m.id !== milestoneId));

    try {
      const res = await fetch(
        `/api/v1/projects/${project.id}/milestones/${milestoneId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete milestone");
    } catch {
      setMilestones(previous);
    }
  };

  // Add milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    try {
      const res = await fetch(`/api/v1/projects/${project.id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newMilestoneTitle.trim(),
          due_date: newMilestoneDueDate || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create milestone");
      const json = await res.json();
      if (json.data) {
        setMilestones((current) => [...current, json.data]);
        setNewMilestoneTitle("");
        setNewMilestoneDueDate("");
        setIsAddingMilestone(false);
      }
    } catch {
      // Handle error
    }
  };

  // Handle task completion toggle
  const handleToggleTaskComplete = async (task: Task) => {
    const isNowCompleted = task.status !== "completed";
    const previous = [...tasks];

    const updatedTasks = tasks.map((t) =>
      t.id === task.id
        ? {
            ...t,
            status: isNowCompleted ? ("completed" as const) : ("todo" as const),
            completed_at: isNowCompleted ? new Date().toISOString() : null,
          }
        : t
    );
    setTasks(updatedTasks);

    // Update project stats progress
    const total = updatedTasks.length;
    const completed = updatedTasks.filter((t) => t.status === "completed").length;
    const progress_percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    setProject((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        total_tasks: total,
        completed_tasks: completed,
        progress_percent,
      },
    }));

    try {
      const endpoint = isNowCompleted
        ? `/api/v1/tasks/${task.id}/complete`
        : `/api/v1/tasks/${task.id}/reopen`;
      await fetch(endpoint, { method: "POST" });
    } catch {
      setTasks(previous);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    const previous = [...tasks];
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);

    try {
      await fetch(`/api/v1/tasks/${taskId}`, { method: "DELETE" });
    } catch {
      setTasks(previous);
    }
  };

  // Create task linked to project
  const handleCreateTask = async (dto: CreateTaskDTO): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dto,
          project_id: project.id,
        }),
      });

      if (!res.ok) return false;
      const json = await res.json();
      if (json.data) {
        const nextTasks = [json.data, ...tasks];
        setTasks(nextTasks);

        const total = nextTasks.length;
        const completed = nextTasks.filter((t) => t.status === "completed").length;
        setProject((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            total_tasks: total,
            completed_tasks: completed,
            progress_percent: Math.round((completed / total) * 100),
          },
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/projects"
          prefetch={false}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Header Overview Card */}
      <Card className="space-y-5 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" className="capitalize text-xs">
                {project.status.replace("_", " ")}
              </Badge>
              <Badge variant="secondary" className="capitalize text-xs">
                <Flag className="h-2.5 w-2.5 mr-1 inline" />
                {project.priority} priority
              </Badge>
            </div>
            <h1 className="font-serif font-medium text-2xl sm:text-3xl text-[var(--foreground)] tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          {/* Quick Dates */}
          <div className="flex flex-col sm:items-end gap-1 text-xs text-[var(--muted-foreground)] font-mono shrink-0">
            {project.start_date && (
              <div>Start: <span className="text-[var(--foreground)]">{project.start_date}</span></div>
            )}
            {project.due_date && (
              <div>Target: <span className="text-[var(--primary)] font-semibold">{project.due_date}</span></div>
            )}
          </div>
        </div>

        {/* Progress Metric */}
        <div className="pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>
                Task Progress ({project.stats.completed_tasks} / {project.stats.total_tasks} completed)
              </span>
            </span>
            <span className="font-semibold text-sm text-[var(--foreground)]">
              {project.stats.progress_percent}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, project.stats.progress_percent))}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Two-Column Responsive Layout: Milestones & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Milestones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
            <h2 className="font-serif font-medium text-lg text-[var(--foreground)] flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--primary)]" />
              <span>Milestones</span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingMilestone(true)}
              className="h-7 text-xs gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </Button>
          </div>

          {/* Add Milestone Inline Form */}
          {isAddingMilestone && (
            <form onSubmit={handleAddMilestone} className="surface p-3.5 space-y-3 rounded-[var(--radius-card)]">
              <Input
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Milestone title..."
                autoFocus
                className="h-8 text-xs"
              />
              <Input
                type="date"
                value={newMilestoneDueDate}
                onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                className="h-8 text-xs"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingMilestone(false)}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm" className="h-7 text-xs">
                  Save
                </Button>
              </div>
            </form>
          )}

          {milestones.length === 0 ? (
            <div className="p-6 text-center rounded-[var(--radius-card)] border border-dashed border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              No milestones defined. Break this project down into tangible checkpoints.
            </div>
          ) : (
            <div className="space-y-2">
              {milestones.map((milestone) => {
                const isCompleted = milestone.status === "completed";
                return (
                  <div
                    key={milestone.id}
                    className={cn(
                      "flex items-center justify-between gap-3 p-3 rounded-[var(--radius-control)] border text-xs transition-colors",
                      isCompleted
                        ? "bg-[var(--muted)]/50 border-[var(--border)] text-[var(--muted-foreground)]"
                        : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isCompleted}
                        onClick={() => handleToggleMilestone(milestone.id)}
                        className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                          isCompleted
                            ? "border-[var(--success)] bg-[var(--success)] text-white"
                            : "border-[var(--border)] hover:border-[var(--primary)]"
                        )}
                      >
                        {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                      </button>
                      <span className={cn("font-medium truncate", isCompleted && "line-through")}>
                        {milestone.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {milestone.due_date && (
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                          {milestone.due_date}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                        aria-label="Delete milestone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Project Tasks (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
            <h2 className="font-serif font-medium text-lg text-[var(--foreground)] flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[var(--primary)]" />
              <span>Project Tasks</span>
            </h2>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCreateTaskOpen(true)}
              className="h-7 text-xs gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add Task</span>
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--card)]/60 text-xs text-[var(--muted-foreground)] space-y-3">
              <p>No tasks attached to this project yet.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateTaskOpen(true)}
                className="gap-2 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create first project task</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleTaskComplete}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Create Dialog */}
      <TaskCreateDialog
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
