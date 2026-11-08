import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createProjectService } from "@/modules/projects/project.service";
import { HabitService } from "@/modules/habits/habit.service";
import { getHabitRepository } from "@/modules/habits/habit.repository";
import { RadarService } from "@/modules/radar/radar.service";
import { getRadarRepository } from "@/modules/radar/radar.repository";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required to seed enclave", undefined, 401);
  }

  const supabase = await createClient();
  const projectService = createProjectService(supabase);
  const habitService = new HabitService(getHabitRepository(supabase));
  const radarService = new RadarService(getRadarRepository(supabase));

  const results = {
    projectsCreated: 0,
    habitsCreated: 0,
    feedsCreated: 0,
  };

  try {
    // 1. Seed Projects (NBD, ACoV, Fossil, Friday)
    const projectRes = await projectService.listProjects(user.id);
    const existingProjectNames = new Set(projectRes.projects.map((p) => p.name.toLowerCase()));

    const targetProjects = [
      {
        name: "NBD",
        description: "Next Big Deal — Core commercial product, client deliverables & roadmap execution.",
        color: "#E05B27",
        milestones: [
          { title: "Architecture validation & core MVP", due_date: null },
          { title: "Deployment pipeline & production hardening", due_date: null },
          { title: "Commercial drop & client launch", due_date: null },
        ],
      },
      {
        name: "ACoV",
        description: "Autonomous Systems & Core Operations — Resilient automation pipelines & agent workflows.",
        color: "#2563EB",
        milestones: [
          { title: "Agent orchestration pipeline", due_date: null },
          { title: "Fault-tolerant telemetry & verification gates", due_date: null },
        ],
      },
      {
        name: "Fossil",
        description: "Knowledge Persistence & Deep Archival — High-fidelity information architecture & vector memory.",
        color: "#D97706",
        milestones: [
          { title: "Archival schema & cold storage syncing", due_date: null },
          { title: "Semantic search & graph linking", due_date: null },
        ],
      },
      {
        name: "Friday",
        description: "Executive AI Companion — Weekly retrospectives, task delegation & cognitive support.",
        color: "#7C3AED",
        milestones: [
          { title: "Conversational task routing", due_date: null },
          { title: "Weekly executive briefing automation", due_date: null },
        ],
      },
    ];

    for (const p of targetProjects) {
      if (!existingProjectNames.has(p.name.toLowerCase())) {
        const created = await projectService.createProject(user.id, {
          name: p.name,
          description: p.description,
          color: p.color,
        });
        results.projectsCreated++;

        for (let i = 0; i < p.milestones.length; i++) {
          try {
            await projectService.createMilestone(user.id, created.id, {
              title: p.milestones[i].title,
              due_date: p.milestones[i].due_date,
            });
          } catch {
            // Milestone creation non-blocking
          }
        }
      }
    }

    // 2. Seed Habits
    const existingHabits = await habitService.listHabits(user.id);
    const existingHabitNames = new Set(existingHabits.map((h) => h.name.toLowerCase()));

    const targetHabits = [
      {
        name: "Deep Work Sprint (60m)",
        description: "Uninterrupted focus session on NBD or ACoV critical path.",
        frequency: "daily" as const,
        target_count: 1,
        color: "#E05B27",
      },
      {
        name: "Review Ongoing Projects (NBD/ACoV/Fossil)",
        description: "Check daily milestones, blockers, and next actions.",
        frequency: "daily" as const,
        target_count: 1,
        color: "#2563EB",
      },
      {
        name: "High-Signal Radar Reading",
        description: "Review curated intelligence feeds and promote insights.",
        frequency: "daily" as const,
        target_count: 1,
        color: "#D97706",
      },
      {
        name: "Evening Reflection & Journal",
        description: "Log mood, wins, lessons, and tomorrow's intention.",
        frequency: "daily" as const,
        target_count: 1,
        color: "#7C3AED",
      },
    ];

    for (const h of targetHabits) {
      if (!existingHabitNames.has(h.name.toLowerCase())) {
        await habitService.createHabit(user.id, h);
        results.habitsCreated++;
      }
    }

    // 3. Seed Curated Radar Feeds
    const existingFeeds = await radarService.listFeeds(user.id);
    const existingFeedUrls = new Set(existingFeeds.map((f) => f.url.toLowerCase()));

    const targetFeeds = [
      // 1. Tech & Autonomous Systems (ACoV & Friday)
      {
        url: "https://news.ycombinator.com/rss",
        title: "Hacker News",
        category: "Tech & Systems",
      },
      {
        url: "https://lilianweng.github.io/index.xml",
        title: "Lil'Log (Lilian Weng)",
        category: "Autonomous Systems & AI",
      },
      {
        url: "https://eugeneyan.com/rss/",
        title: "Eugene Yan",
        category: "Autonomous Systems & AI",
      },
      {
        url: "https://simonwillison.net/atom/entries/",
        title: "Simon Willison's Weblog",
        category: "Autonomous Systems & AI",
      },
      {
        url: "https://hamel.dev/index.xml",
        title: "Hamel's Blog",
        category: "Autonomous Systems & AI",
      },
      {
        url: "https://magazine.sebastianraschka.com/feed",
        title: "Ahead of AI (Sebastian Raschka)",
        category: "Autonomous Systems & AI",
      },
      {
        url: "https://huyenchip.com/feed.xml",
        title: "Chip Huyen",
        category: "Autonomous Systems & AI",
      },

      // 2. Commercial Venture & Strategy (NBD)
      {
        url: "https://longform.asmartbear.com/index.xml",
        title: "A Smart Bear (Jason Cohen)",
        category: "Venture & Strategy",
      },
      {
        url: "https://www.bitsaboutmoney.com/archive/rss/",
        title: "Bits about Money (Patrick McKenzie)",
        category: "Venture & Strategy",
      },
      {
        url: "https://stratechery.com/feed/",
        title: "Stratechery (Ben Thompson)",
        category: "Venture & Strategy",
      },
      {
        url: "https://elenaverna.substack.com/feed",
        title: "Elena's Growth Scoop",
        category: "Venture & Strategy",
      },
      {
        url: "https://danluu.com/atom.xml",
        title: "Dan Luu",
        category: "Venture & Strategy",
      },
      {
        url: "https://www.thediff.co/feed",
        title: "The Diff (Byrne Hobart)",
        category: "Venture & Strategy",
      },

      // 3. Knowledge Persistence & Software Craft (Fossil & Personal OS)
      {
        url: "https://www.inkandswitch.com/index.xml",
        title: "Ink & Switch",
        category: "Knowledge & Software Craft",
      },
      {
        url: "https://maggieappleton.com/rss.xml",
        title: "Maggie Appleton",
        category: "Knowledge & Software Craft",
      },
      {
        url: "https://feeds.feedburner.com/martinkl?format=xml",
        title: "Martin Kleppmann",
        category: "Knowledge & Software Craft",
      },
      {
        url: "https://newsletter.squishy.computer/feed",
        title: "Squishy Computer (Gordon Brander)",
        category: "Knowledge & Software Craft",
      },
      {
        url: "https://www.robinsloan.com/feed.xml",
        title: "Robin Sloan",
        category: "Knowledge & Software Craft",
      },
      {
        url: "https://ciechanow.ski/atom.xml",
        title: "Bartosz Ciechanowski",
        category: "Knowledge & Software Craft",
      },
    ];

    for (const f of targetFeeds) {
      if (!existingFeedUrls.has(f.url.toLowerCase())) {
        try {
          await radarService.subscribeFeed(user.id, f);
          results.feedsCreated++;
        } catch (feedErr) {
          console.warn("Feed seeding non-blocking skip:", f.url, feedErr);
        }
      }
    }

    return apiSuccess({
      message: "Personal enclave initialized with user interests.",
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to seed enclave";
    return apiError("SEED_ERROR", message, undefined, 500);
  }
}
