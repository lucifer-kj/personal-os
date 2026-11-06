import { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { TaskList } from "@/components/tasks/TaskList";

export const metadata: Metadata = {
  title: "Tasks — Personal OS",
  description: "Actionable work management and intentional execution.",
};

export default function TasksPage() {
  return (
    <PageShell
      eyebrow="Productivity"
      title="Tasks"
      description="Manage actionable work, prioritize outcomes, and track progress with focused calm."
    >
      <div className="pt-2">
        <TaskList />
      </div>
    </PageShell>
  );
}
