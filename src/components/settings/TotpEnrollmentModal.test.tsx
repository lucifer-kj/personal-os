import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { TotpEnrollmentModal } from "./TotpEnrollmentModal";
import * as mfaModule from "@/lib/auth/mfa";

describe("TotpEnrollmentModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <TotpEnrollmentModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders Google Authenticator setup modal and displays secret and QR", async () => {
    vi.spyOn(mfaModule, "enrollGoogleAuthenticator").mockResolvedValue({
      data: {
        factorId: "factor-test",
        secret: "TESTSECRETKEY123",
        qrCode: "data:image/svg+xml;utf8,<svg></svg>",
        uri: "otpauth://totp/Personal%20OS",
      },
      error: null,
    });

    render(
      <TotpEnrollmentModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Google Authenticator Setup")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("TESTSECRETKEY123")).toBeInTheDocument();
    });

    expect(screen.getByAltText("Google Authenticator QR Code")).toBeInTheDocument();
    expect(screen.getByText("Verify & Activate")).toBeInTheDocument();
  });

  it("progresses to recovery step upon entering valid 6-digit verification code", async () => {
    vi.spyOn(mfaModule, "enrollGoogleAuthenticator").mockResolvedValue({
      data: {
        factorId: "factor-test",
        secret: "TESTSECRETKEY123",
        qrCode: "data:image/svg+xml;utf8,<svg></svg>",
        uri: "otpauth://totp/Personal%20OS",
      },
      error: null,
    });

    vi.spyOn(mfaModule, "verifyMfaChallenge").mockResolvedValue({ success: true });
    vi.spyOn(mfaModule, "generateRecoveryCodes").mockReturnValue([
      "RECO-1111",
      "RECO-2222",
      "RECO-3333",
      "RECO-4444",
      "RECO-5555",
      "RECO-6666",
      "RECO-7777",
      "RECO-8888",
    ]);
    vi.spyOn(mfaModule, "saveRecoveryCodes").mockResolvedValue({ success: true });

    render(
      <TotpEnrollmentModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    await waitFor(() => {
      expect(screen.getByText("TESTSECRETKEY123")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("000000");
    fireEvent.change(input, { target: { value: "123456" } });

    const submitBtn = screen.getByText("Verify & Activate");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Save Your Emergency Recovery Codes")).toBeInTheDocument();
      expect(screen.getByText("RECO-1111")).toBeInTheDocument();
      expect(screen.getByText("RECO-8888")).toBeInTheDocument();
    });

    // Check confirmation checkbox to enable finish
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    const finishBtn = screen.getByRole("button", { name: /Complete Setup/i });
    expect(finishBtn).toBeDisabled();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(finishBtn).toBeEnabled();

    fireEvent.click(finishBtn);
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
