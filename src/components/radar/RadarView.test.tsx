import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { RadarView } from "./RadarView";
import { RSSFeed, RadarItem } from "@/modules/radar/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("RadarView Component", () => {
  const mockFeeds: RSSFeed[] = [
    {
      id: "feed-1",
      user_id: "user-1",
      title: "Hacker News",
      url: "https://news.ycombinator.com/rss",
      site_url: "https://news.ycombinator.com",
      category: "Tech",
      icon_url: null,
      last_fetched_at: new Date().toISOString(),
      fetch_error: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockItems: RadarItem[] = [
    {
      id: "item-1",
      user_id: "user-1",
      feed_id: "feed-1",
      title: "Self-hosting Workstation Revolution",
      url: "https://news.ycombinator.com/item?id=999",
      author: "pg",
      summary: "Exploring privacy-first local personal operating systems.",
      content: "Full essay discussing personal enclave computing.",
      published_at: new Date().toISOString(),
      is_read: false,
      is_starred: false,
      promoted_to_note_id: null,
      promoted_to_post_id: null,
      created_at: new Date().toISOString(),
      feed: {
        title: "Hacker News",
        category: "Tech",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, feeds list, and active signal article", () => {
    render(<RadarView initialFeeds={mockFeeds} initialItems={mockItems} />);

    expect(screen.getByText("The Radar")).toBeDefined();
    expect(screen.getAllByText("Hacker News").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Self-hosting Workstation Revolution").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Promote to Note")).toBeDefined();
    expect(screen.getByText("Draft Social Post")).toBeDefined();
  });

  it("filters items by read/unread/starred tabs", () => {
    render(<RadarView initialFeeds={mockFeeds} initialItems={mockItems} />);

    // Click starred tab (item is not starred, so list should empty)
    const starredBtn = screen.getByRole("button", { name: /^starred$/i });
    fireEvent.click(starredBtn);

    expect(screen.getByText("No signal found matching criteria.")).toBeDefined();
  });

  it("opens the Add Feed subscription modal", () => {
    render(<RadarView initialFeeds={mockFeeds} initialItems={mockItems} />);

    const addBtn = screen.getByRole("button", { name: /add feed/i });
    fireEvent.click(addBtn);

    expect(screen.getByText("Subscribe to Signal")).toBeDefined();
    expect(screen.getByPlaceholderText(/news\.ycombinator\.com\/rss/i)).toBeDefined();
  });
});
