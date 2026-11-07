import * as React from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getSocialStudioService } from "@/modules/studio/studio.service";
import { PageShell } from "@/components/layout/PageShell";
import { SocialStudioView } from "@/components/studio/SocialStudioView";

export const metadata: Metadata = {
  title: "Social Studio — Personal OS",
  description: "Draft, schedule, and preview social media posts with rich media assets.",
};

async function StudioContent() {
  await connection();

  const user = await getAuthenticatedUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000001";

  const supabase = await createClient();
  const studioService = getSocialStudioService(supabase);
  const posts = await studioService.listPosts(userId);

  return <SocialStudioView initialPosts={posts} />;
}

export default function StudioPage() {
  return (
    <PageShell
      title="Social Studio"
      description="Content crafting and scheduling workstation"
    >
      <React.Suspense
        fallback={
          <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-6 w-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[var(--muted-foreground)] font-mono">
                Loading Studio...
              </p>
            </div>
          </div>
        }
      >
        <StudioContent />
      </React.Suspense>
    </PageShell>
  );
}
