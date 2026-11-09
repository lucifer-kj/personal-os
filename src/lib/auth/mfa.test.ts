import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  enrollGoogleAuthenticator,
  verifyMfaChallenge,
  unenrollGoogleAuthenticator,
  getMfaStatus,
  generateRecoveryCodes,
  hashRecoveryCode,
  saveRecoveryCodes,
  verifyAndBurnRecoveryCode,
} from "./mfa";

describe("MFA and Google Authenticator Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateRecoveryCodes", () => {
    it("generates the requested number of codes with valid format", () => {
      const codes = generateRecoveryCodes(8);
      expect(codes).toHaveLength(8);
      for (const code of codes) {
        expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      }
    });

    it("generates unique codes", () => {
      const codes = generateRecoveryCodes(10);
      const unique = new Set(codes);
      expect(unique.size).toBe(10);
    });
  });

  describe("hashRecoveryCode", () => {
    it("generates deterministic SHA-256 hash for identical codes", async () => {
      const hash1 = await hashRecoveryCode("ABCD-1234");
      const hash2 = await hashRecoveryCode("abcd-1234");
      const hash3 = await hashRecoveryCode("ABCD1234");
      expect(hash1).toBe(hash2);
      expect(hash1).toBe(hash3);
      expect(hash1.length).toBeGreaterThanOrEqual(16);
    });

    it("generates distinct hashes for distinct codes", async () => {
      const hash1 = await hashRecoveryCode("ABCD-1234");
      const hash2 = await hashRecoveryCode("WXYZ-9876");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("enrollGoogleAuthenticator", () => {
    it("calls supabase.auth.mfa.enroll with Google Authenticator friendly name", async () => {
      const mockSupabase = {
        auth: {
          mfa: {
            enroll: vi.fn().mockResolvedValue({
              data: {
                id: "factor-123",
                type: "totp",
                totp: {
                  secret: "SECRET123",
                  qr_code: "data:image/svg+xml;utf8,<svg></svg>",
                  uri: "otpauth://totp/Personal%20OS?secret=SECRET123",
                },
              },
              error: null,
            }),
          },
        },
      } as any;

      const res = await enrollGoogleAuthenticator(mockSupabase);
      expect(mockSupabase.auth.mfa.enroll).toHaveBeenCalledWith({
        factorType: "totp",
        issuer: "Personal OS",
        friendlyName: "Google Authenticator",
      });
      expect(res.error).toBeNull();
      expect(res.data?.factorId).toBe("factor-123");
      expect(res.data?.secret).toBe("SECRET123");
    });

    it("handles enrollment errors cleanly", async () => {
      const mockSupabase = {
        auth: {
          mfa: {
            enroll: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Factor limit reached" },
            }),
          },
        },
      } as any;

      const res = await enrollGoogleAuthenticator(mockSupabase);
      expect(res.data).toBeNull();
      expect(res.error).toBe("Factor limit reached");
    });
  });

  describe("verifyMfaChallenge", () => {
    it("creates challenge and verifies code successfully", async () => {
      const mockSupabase = {
        auth: {
          mfa: {
            challenge: vi.fn().mockResolvedValue({
              data: { id: "challenge-456" },
              error: null,
            }),
            verify: vi.fn().mockResolvedValue({
              data: {},
              error: null,
            }),
          },
        },
      } as any;

      const res = await verifyMfaChallenge("factor-123", "123456", mockSupabase);
      expect(mockSupabase.auth.mfa.challenge).toHaveBeenCalledWith({ factorId: "factor-123" });
      expect(mockSupabase.auth.mfa.verify).toHaveBeenCalledWith({
        factorId: "factor-123",
        challengeId: "challenge-456",
        code: "123456",
      });
      expect(res.success).toBe(true);
    });

    it("returns error if challenge creation fails", async () => {
      const mockSupabase = {
        auth: {
          mfa: {
            challenge: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Challenge failed" },
            }),
          },
        },
      } as any;

      const res = await verifyMfaChallenge("factor-123", "123456", mockSupabase);
      expect(res.success).toBe(false);
      expect(res.error).toBe("Challenge failed");
    });

    it("returns error if verification code is invalid", async () => {
      const mockSupabase = {
        auth: {
          mfa: {
            challenge: vi.fn().mockResolvedValue({
              data: { id: "challenge-456" },
              error: null,
            }),
            verify: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Invalid code" },
            }),
          },
        },
      } as any;

      const res = await verifyMfaChallenge("factor-123", "999999", mockSupabase);
      expect(res.success).toBe(false);
      expect(res.error).toBe("Invalid code");
    });
  });

  describe("unenrollGoogleAuthenticator", () => {
    it("calls unenroll and clears recovery codes from user metadata", async () => {
      const mockSupabase = {
        auth: {
          mfa: {
            unenroll: vi.fn().mockResolvedValue({ error: null }),
          },
          updateUser: vi.fn().mockResolvedValue({ error: null }),
        },
      } as any;

      const res = await unenrollGoogleAuthenticator("factor-123", mockSupabase);
      expect(mockSupabase.auth.mfa.unenroll).toHaveBeenCalledWith({ factorId: "factor-123" });
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        data: { mfa_recovery_codes: [] },
      });
      expect(res.success).toBe(true);
    });
  });

  describe("getMfaStatus", () => {
    it("reports enrolled=true when verified TOTP factors exist", async () => {
      const mockSupabase = {
        auth: {
          mfa: {
            listFactors: vi.fn().mockResolvedValue({
              data: {
                totp: [
                  {
                    id: "factor-1",
                    friendly_name: "Google Authenticator",
                    factor_type: "totp",
                    status: "verified",
                    created_at: "2026-11-09T00:00:00Z",
                  },
                ],
              },
            }),
            getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
              data: {
                currentLevel: "aal2",
                nextLevel: "aal2",
              },
            }),
          },
        },
      } as any;

      const status = await getMfaStatus(mockSupabase);
      expect(status.enrolled).toBe(true);
      expect(status.currentLevel).toBe("aal2");
      expect(status.factors).toHaveLength(1);
    });

    it("reports enrolled=false when no verified factors exist", async () => {
      const mockSupabase = {
        auth: {
          mfa: {
            listFactors: vi.fn().mockResolvedValue({
              data: { totp: [] },
            }),
            getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
              data: { currentLevel: "aal1", nextLevel: "aal1" },
            }),
          },
        },
      } as any;

      const status = await getMfaStatus(mockSupabase);
      expect(status.enrolled).toBe(false);
      expect(status.currentLevel).toBe("aal1");
    });
  });

  describe("saveRecoveryCodes and verifyAndBurnRecoveryCode", () => {
    it("saves and burns valid recovery codes", async () => {
      let storedMetadata: any = {};

      const mockSupabase = {
        auth: {
          updateUser: vi.fn().mockImplementation(({ data }) => {
            storedMetadata = { ...storedMetadata, ...data };
            return Promise.resolve({ error: null });
          }),
          getUser: vi.fn().mockImplementation(() => {
            return Promise.resolve({
              data: {
                user: { id: "user-1", user_metadata: storedMetadata },
              },
              error: null,
            });
          }),
        },
      } as any;

      const codes = ["CODE-1111", "CODE-2222"];
      const saveRes = await saveRecoveryCodes(codes, mockSupabase);
      expect(saveRes.success).toBe(true);

      // Verify code 1
      const verify1 = await verifyAndBurnRecoveryCode("CODE-1111", mockSupabase);
      expect(verify1.valid).toBe(true);
      expect(verify1.remainingCount).toBe(1);

      // Re-verifying code 1 must fail (single-use burned)
      const verifyAgain = await verifyAndBurnRecoveryCode("CODE-1111", mockSupabase);
      expect(verifyAgain.valid).toBe(false);

      // Verify code 2
      const verify2 = await verifyAndBurnRecoveryCode("code-2222", mockSupabase);
      expect(verify2.valid).toBe(true);
      expect(verify2.remainingCount).toBe(0);
    });
  });
});
