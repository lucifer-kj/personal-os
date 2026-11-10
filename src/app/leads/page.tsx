import { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LeadList } from "@/components/leads/LeadList";

export const metadata: Metadata = {
  title: "Leads & CRM — Personal OS",
  description: "Client acquisition pipeline, lead scoring, and automated conversion.",
};

export default function LeadsPage() {
  return (
    <PageShell
      eyebrow="CRM &amp; Growth"
      title="Leads &amp; Clients"
      description="Manage prospective clients, track acquisition scores, and convert qualified leads into active projects."
    >
      <div className="pt-2">
        <LeadList />
      </div>
    </PageShell>
  );
}
