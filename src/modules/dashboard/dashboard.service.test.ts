import { describe, it, expect, beforeEach } from "vitest";
import { DashboardService } from "./dashboard.service";
import { DayService } from "@/modules/day/day.service";
import { InMemoryDayRepository } from "@/modules/day/day.repository";
import { ProjectService } from "@/modules/projects/project.service";
import { getInMemoryProjectRepository } from "@/modules/projects/project.repository";
import { getInMemoryTaskRepository } from "@/modules/tasks/task.repository";

describe("DashboardService", () => {
  let dayRepo: InMemoryDayRepository;
  let taskRepo = getInMemoryTaskRepository();
  let projectRepo = getInMemoryProjectRepository();
  let dayService: DayService;
  let projectService: ProjectService;
  let dashboardService: DashboardService;

  const USER_ID = "00000000-0000-0000-0000-000000000001";
  const TODAY = "2026-11-06";

  beforeEach(() => {
    dayRepo = new InMemoryDayRepository();
    taskRepo = getInMemoryTaskRepository();
    projectRepo = getInMemoryProjectRepository();

    dayRepo.clear();
    taskRepo.clear();
    projectRepo.clear();

    dayService = new DayService(dayRepo, taskRepo);
    projectService = new ProjectService(projectRepo, taskRepo);
    dashboardService = new DashboardService(dayService, projectService);
  });

  it("returns complete dashboard overview with greeting and metrics", async () => {
    // Create an active project
    const project = await projectService.createProject(USER_ID, {
      name: "Core Platform",
      status: "active",
    });

    // Create tasks
    await taskRepo.create(USER_ID, {
      title: "Urgent Task",
      due_date: TODAY,
      priority: "urgent",
      estimated_minutes: 60,
      project_id: project.id,
      status: "todo",
    });

    await taskRepo.create(USER_ID, {
      title: "Medium Completed Task",
      due_date: TODAY,
      priority: "medium",
      status: "completed",
    });

    // Set intention
    await dayService.setIntention(USER_ID, TODAY, "Zero defect release");

    const overview = await dashboardService.getDashboardOverview(USER_ID, TODAY);

    expect(overview.date).toBe(TODAY);
    expect(["Good morning", "Good afternoon", "Good evening"]).toContain(overview.greeting);
    expect(overview.intention).toBe("Zero defect release");

    // Metrics
    expect(overview.metrics.tasks_completed_today).toBe(1);
    expect(overview.metrics.tasks_pending_today).toBe(1);
    expect(overview.metrics.estimated_focus_minutes).toBe(60);
    expect(overview.metrics.active_projects_count).toBe(1);

    // Sorted agenda: pending urgent task first, completed medium task second
    expect(overview.today_agenda.length).toBe(2);
    expect(overview.today_agenda[0].title).toBe("Urgent Task");
    expect(overview.today_agenda[1].title).toBe("Medium Completed Task");

    // Active project
    expect(overview.active_projects.length).toBe(1);
    expect(overview.active_projects[0].name).toBe("Core Platform");
  });
});
