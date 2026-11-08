import { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = {
  title: "Settings & Enclave — Personal OS",
  description: "Configure workspace preferences, populate interests, and manage security enclave.",
};

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Preferences"
      title="Settings & Enclave"
      description="Manage your single-user workstation, initialize ongoing projects, and configure layout preferences."
    >
      <SettingsView />
    </PageShell>
  );
}
