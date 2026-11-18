import { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LeadsView } from "@/components/leads/LeadsView";

export const metadata: Metadata = {
  title: "Leads & Clients — Personal OS",
  description: "Autonomous lead generation, technical audits, consultative pitches, and client conversion.",
};

export default function LeadsPage() {
  return (
    <PageShell
      eyebrow="Growth & Revenue"
      title="Leads & Clients"
      description="Autonomous B2B discovery, technical Lighthouse audits, consultative WhatsApp pitches, and client pipeline conversion."
    >
      <div className="pt-2">
        <LeadsView />
      </div>
    </PageShell>
  );
}
