import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionExpirationModal } from "./SessionExpirationModal";

describe("SessionExpirationModal Component", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <SessionExpirationModal
        isOpen={false}
        timeRemainingMs={120000}
        isExtending={false}
        onExtend={vi.fn()}
        onSignOut={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders countdown and warning details when isOpen is true", () => {
    render(
      <SessionExpirationModal
        isOpen={true}
        timeRemainingMs={4 * 60 * 1000 + 45 * 1000} // 4 minutes 45 seconds
        isExtending={false}
        onExtend={vi.fn()}
        onSignOut={vi.fn()}
      />
    );

    expect(screen.getByText("Session Expiring Soon")).toBeDefined();
    expect(screen.getByText("Inactivity Timeout")).toBeDefined();
    expect(screen.getByText("04:45")).toBeDefined();
    expect(screen.getByRole("button", { name: /stay signed in/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /sign out now/i })).toBeDefined();
  });

  it("invokes onExtend when Stay Signed In button is clicked", () => {
    const onExtend = vi.fn();
    render(
      <SessionExpirationModal
        isOpen={true}
        timeRemainingMs={120000}
        isExtending={false}
        onExtend={onExtend}
        onSignOut={vi.fn()}
      />
    );

    const extendBtn = screen.getByRole("button", { name: /stay signed in/i });
    fireEvent.click(extendBtn);
    expect(onExtend).toHaveBeenCalled();
  });

  it("invokes onSignOut when Sign Out Now button is clicked", () => {
    const onSignOut = vi.fn();
    render(
      <SessionExpirationModal
        isOpen={true}
        timeRemainingMs={120000}
        isExtending={false}
        onExtend={vi.fn()}
        onSignOut={onSignOut}
      />
    );

    const signOutBtn = screen.getByRole("button", { name: /sign out now/i });
    fireEvent.click(signOutBtn);
    expect(onSignOut).toHaveBeenCalled();
  });
});
