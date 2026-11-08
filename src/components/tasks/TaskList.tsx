"use client";

import * as React from "react";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { Task, CreateTaskDTO, TaskPriority } from "@/modules/tasks/types";
import { TaskItem } from "./TaskItem";
import { TaskEmptyState } from "./TaskEmptyState";
import { TaskSkeleton } from "./TaskSkeleton";
import { TaskCreateDialog } from "./TaskCreateDialog";
import { TaskFilterBar, StatusFilterOption } from "./TaskFilterBar";
import { Button } from "@/components/ui/button";

interface TaskListProps {
  initialTasks?: Task[];
}

export function TaskList({ initialTasks }: TaskListProps) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks || []);
  const [isLoading, setIsLoading] = React.useState(!initialTasks);
  const [error, setError] = React.useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterOption>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriority | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Fetch Tasks from API
  const fetchTasks = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/tasks");
      if (!res.ok) {
        throw new Error(`Failed to load tasks (${res.status})`);
      }
      const json = await res.json();
      setTasks(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    if (!initialTasks) {
      fetch("/api/v1/tasks")
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load tasks (${res.status})`);
          return res.json();
        })
        .then((json) => {
          if (isMounted) {
            setTasks(json.data || []);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err instanceof Error ? err.message : "Failed to load tasks");
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [initialTasks]);

  // Optimistic Toggle Complete / Reopen
  const handleToggleComplete = async (task: Task) => {
    const isNowCompleted = task.status !== "completed";
    const previousTasks = [...tasks];

    // Optimistic state update
    setTasks((current) =>
      current.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: isNowCompleted ? "completed" : "todo",
              completed_at: isNowCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );

    try {
      const endpoint = isNowCompleted
        ? `/api/v1/tasks/${task.id}/complete`
        : `/api/v1/tasks/${task.id}/reopen`;

      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) {
        throw new Error("Action failed");
      }
      const json = await res.json();
      if (json.data) {
        setTasks((current) =>
          current.map((t) => (t.id === task.id ? json.data : t))
        );
      }
    } catch {
      // Revert on error
      setTasks(previousTasks);
    }
  };

  // Delete Task
  const handleDelete = async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks((current) => current.filter((t) => t.id !== taskId));

    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Deletion failed");
      }
    } catch {
      setTasks(previousTasks);
    }
  };

  // Create Task
  const handleCreateTask = async (dto: CreateTaskDTO): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        return false;
      }

      const json = await res.json();
      if (json.data) {
        setTasks((current) => [json.data, ...current]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Filter Logic
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (statusFilter === "active" && t.status === "completed") return false;
      if (statusFilter === "completed" && t.status !== "completed") return false;

      // Priority filter
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Controls: Filter Bar & New Task Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <TaskFilterBar
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <Button
          variant="default"
          onClick={() => setIsCreateOpen(true)}
          className="h-9 px-4 rounded-lg text-xs font-semibold gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Main Content States */}
      {isLoading ? (
        <TaskSkeleton />
      ) : error ? (
        <div
          data-testid="task-error-state"
          className="surface flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-card)] border-[var(--destructive)]/30 bg-[var(--card)] my-4"
        >
          <AlertCircle className="h-8 w-8 text-[var(--destructive)] mb-2" />
          <p className="text-sm font-medium text-[var(--foreground)]">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTasks}
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <TaskEmptyState
          filtered={tasks.length > 0}
          onCaptureClick={() => setIsCreateOpen(true)}
        />
      ) : (
        <div data-testid="task-items-container" className="space-y-2.5">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <TaskCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
