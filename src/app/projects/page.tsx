import { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectList } from "@/components/projects/ProjectList";

export const metadata: Metadata = {
  title: "Projects — Personal OS",
  description: "Track deliverables, milestones, and high-level workstreams.",
};

export default function ProjectsPage() {
  return (
    <PageShell
      eyebrow="Work"
      title="Projects"
      description="Track deliverables, organize milestones, and monitor true progress across active workstreams."
    >
      <div className="pt-2">
        <ProjectList />
      </div>
    </PageShell>
  );
}
