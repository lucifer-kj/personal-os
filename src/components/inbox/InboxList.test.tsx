import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InboxList } from "./InboxList";
import { InboxItem } from "@/modules/inbox/types";

describe("InboxList component", () => {
  const mockItems: InboxItem[] = [
    {
      id: "item-1",
      user_id: "user-1",
      title: "Quick idea for dashboard",
      content: "Add focus time breakdown",
      capture_type: "idea",
      status: "unprocessed",
      source: "manual",
      url: null,
      converted_entity_type: null,
      converted_entity_id: null,
      processed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "item-2",
      user_id: "user-1",
      title: "Already handled item",
      content: null,
      capture_type: "task",
      status: "processed",
      source: "manual",
      url: null,
      converted_entity_type: "task",
      converted_entity_id: "task-123",
      processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it("renders unprocessed items and provides convert to task button", () => {
    render(<InboxList initialItems={mockItems} />);

    expect(screen.getByText("Quick idea for dashboard")).toBeDefined();
    expect(screen.getByText("Add focus time breakdown")).toBeDefined();
    expect(screen.getByRole("button", { name: /convert to task/i })).toBeDefined();
  });

  it("filters to processed tab when clicked", () => {
    render(<InboxList initialItems={mockItems} />);

    const processedTab = screen.getByRole("button", { name: "Processed" });
    fireEvent.click(processedTab);

    expect(screen.getByText("Already handled item")).toBeDefined();
    expect(screen.getByText("Converted to task")).toBeDefined();
  });

  it("shows inbox zero empty state when no items match", () => {
    render(<InboxList initialItems={[]} />);

    expect(screen.getByText("Inbox Zero")).toBeDefined();
    expect(screen.getByText(/Everything captured has been triaged/i)).toBeDefined();
  });
});
