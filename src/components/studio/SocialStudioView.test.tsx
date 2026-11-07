import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { SocialStudioView } from "./SocialStudioView";
import { SocialPost } from "@/modules/studio/types";

describe("SocialStudioView Component", () => {
  const mockPosts: SocialPost[] = [
    {
      id: "post-1",
      user_id: "user-1",
      title: "First X Drop",
      content: "Hello world! This is my first tweet from Personal OS Studio.",
      platform: "x",
      status: "draft",
      media_urls: [],
      media_type: "none",
      scheduled_at: null,
      published_at: null,
      tags: ["intro"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the studio header and initial post list", () => {
    render(<SocialStudioView initialPosts={mockPosts} />);

    expect(screen.getByText("Social Studio")).toBeDefined();
    expect(screen.getByText("New Post")).toBeDefined();
    expect(screen.getByText("First X Drop")).toBeDefined();
  });

  it("switches platforms and calculates character limits correctly", () => {
    render(<SocialStudioView initialPosts={[]} />);

    // Default empty post has limit 280 (x)
    expect(screen.getByText(/280/)).toBeDefined();

    // The workbench platform button is the second 'linkedin' button
    const buttons = screen.getAllByRole("button", { name: /^linkedin$/i });
    const editorBtn = buttons[buttons.length - 1];
    fireEvent.click(editorBtn);

    // Limit should now be 3000
    expect(screen.getByText(/3000/)).toBeDefined();
  });

  it("renders live preview card reflecting typed content", () => {
    render(<SocialStudioView initialPosts={[]} />);

    const textarea = screen.getByPlaceholderText(/Draft your post here/i);
    fireEvent.change(textarea, {
      target: { value: "Shipping v1 with #turbopack today!" },
    });

    expect(screen.getAllByText(/#turbopack/).length).toBeGreaterThanOrEqual(1);
  });
});
