"use client";

import * as React from "react";
import { Plus, RefreshCw, AlertCircle, FolderPlus } from "lucide-react";
import { ProjectWithStats, CreateProjectDTO, ProjectPriority } from "@/modules/projects/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectCreateDialog } from "./ProjectCreateDialog";
import { ProjectFilterBar, ProjectStatusFilterOption } from "./ProjectFilterBar";
import { Button } from "@/components/ui/button";

interface ProjectListProps {
  initialProjects?: ProjectWithStats[];
}

export function ProjectList({ initialProjects }: ProjectListProps) {
  const [projects, setProjects] = React.useState<ProjectWithStats[]>(initialProjects || []);
  const [isLoading, setIsLoading] = React.useState(!initialProjects);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatusFilterOption>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<ProjectPriority | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const fetchProjects = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/projects");
      if (!res.ok) {
        throw new Error(`Failed to load projects (${res.status})`);
      }
      const json = await res.json();
      setProjects(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    if (!initialProjects) {
      fetch("/api/v1/projects")
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
          return res.json();
        })
        .then((json) => {
          if (isMounted) {
            setProjects(json.data || []);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err instanceof Error ? err.message : "Failed to load projects");
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [initialProjects]);

  const handleCreateProject = async (dto: CreateProjectDTO): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        return false;
      }

      const json = await res.json();
      if (json.data) {
        const withStats: ProjectWithStats = {
          ...json.data,
          stats: {
            total_tasks: 0,
            completed_tasks: 0,
            progress_percent: 0,
            total_milestones: 0,
            completed_milestones: 0,
          },
        };
        setProjects((current) => [withStats, ...current]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (priorityFilter !== "all" && p.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [projects, statusFilter, priorityFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <ProjectFilterBar
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
          <span>New Project</span>
        </Button>
      </div>

      {/* Main Content States */}
      {isLoading ? (
        <div data-testid="project-skeleton" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
              <div className="h-5 w-1/3 rounded bg-[var(--muted)]" />
              <div className="h-4 w-2/3 rounded bg-[var(--muted)]/60" />
              <div className="pt-8 h-2 w-full rounded bg-[var(--muted)]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          data-testid="project-error-state"
          className="surface flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-card)] border-[var(--destructive)]/30 bg-[var(--card)] my-4"
        >
          <AlertCircle className="h-8 w-8 text-[var(--destructive)] mb-2" />
          <p className="text-sm font-medium text-[var(--foreground)]">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchProjects} className="mt-4 gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div
          data-testid="project-empty-state"
          className="surface flex flex-col items-center justify-center p-12 text-center border-dashed rounded-[var(--radius-panel)] border-[var(--border)] bg-[var(--card)]/60 my-6"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] mb-4">
            <FolderPlus className="h-6 w-6 stroke-[1.75]" />
          </div>
          <h3 className="font-serif font-medium text-lg text-[var(--foreground)] tracking-tight">
            {projects.length > 0 ? "No projects match the selected filter" : "No projects created yet"}
          </h3>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-sm leading-relaxed">
            {projects.length > 0
              ? "Adjust your status or priority filters to see other active projects."
              : "Projects group actionable work toward high-level goals and meaningful deliverables."}
          </p>
          <div className="mt-6">
            <Button variant="default" size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Create first project</span>
            </Button>
          </div>
        </div>
      ) : (
        <div data-testid="project-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Modal */}
      <ProjectCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
