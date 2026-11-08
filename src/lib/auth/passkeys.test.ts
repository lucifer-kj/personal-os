import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  signInWithPasskey,
  registerPasskey,
  listPasskeys,
  deletePasskey,
} from "./passkeys";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("WebAuthn / Passkeys Auth Module", () => {
  const originalPublicKeyCredential = window.PublicKeyCredential;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.PublicKeyCredential = originalPublicKeyCredential;
  });

  describe("Browser & Platform Detection", () => {
    it("detects WebAuthn support correctly", () => {
      // Defined case
      (window as unknown as { PublicKeyCredential: unknown }).PublicKeyCredential = function () {};
      expect(isWebAuthnSupported()).toBe(true);

      // Undefined case
      delete (window as unknown as { PublicKeyCredential?: unknown }).PublicKeyCredential;
      expect(isWebAuthnSupported()).toBe(false);
    });

    it("checks platform authenticator availability", async () => {
      const mockIsAvailable = vi.fn().mockResolvedValue(true);
      (window as unknown as { PublicKeyCredential: unknown }).PublicKeyCredential = Object.assign(
        function () {},
        { isUserVerifyingPlatformAuthenticatorAvailable: mockIsAvailable }
      );

      const available = await isPlatformAuthenticatorAvailable();
      expect(available).toBe(true);
      expect(mockIsAvailable).toHaveBeenCalled();
    });

    it("returns false if platform authenticator query throws or is unsupported", async () => {
      delete (window as unknown as { PublicKeyCredential?: unknown }).PublicKeyCredential;
      expect(await isPlatformAuthenticatorAvailable()).toBe(false);

      (window as unknown as { PublicKeyCredential: unknown }).PublicKeyCredential = Object.assign(
        function () {},
        {
          isUserVerifyingPlatformAuthenticatorAvailable: vi
            .fn()
            .mockRejectedValue(new Error("Not supported")),
        }
      );
      expect(await isPlatformAuthenticatorAvailable()).toBe(false);
    });
  });

  describe("signInWithPasskey", () => {
    it("returns an error if WebAuthn is not supported", async () => {
      delete (window as unknown as { PublicKeyCredential?: unknown }).PublicKeyCredential;
      const res = await signInWithPasskey();
      expect(res.user).toBeNull();
      expect(res.session).toBeNull();
      expect(res.error?.message).toContain("not supported");
    });

    it("initiates and resolves passkey authentication successfully", async () => {
      (window as unknown as { PublicKeyCredential: unknown }).PublicKeyCredential = function () {};
      const mockUser = { id: "user-123", email: "321arifali@gmail.com" };
      const mockSession = { access_token: "token-abc" };

      const mockClient = {
        auth: {
          signInWithPasskey: vi.fn().mockResolvedValue({
            data: { user: mockUser, session: mockSession },
            error: null,
          }),
        },
      } as unknown as SupabaseClient;

      const res = await signInWithPasskey({ client: mockClient });
      expect(res.error).toBeNull();
      expect(res.user).toEqual(mockUser);
      expect(res.session).toEqual(mockSession);
      expect(mockClient.auth.signInWithPasskey).toHaveBeenCalled();
    });

    it("handles ceremony failures gracefully", async () => {
      (window as unknown as { PublicKeyCredential: unknown }).PublicKeyCredential = function () {};
      const mockClient = {
        auth: {
          signInWithPasskey: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "User cancelled ceremony" },
          }),
        },
      } as unknown as SupabaseClient;

      const res = await signInWithPasskey({ client: mockClient });
      expect(res.user).toBeNull();
      expect(res.session).toBeNull();
      expect(res.error?.message).toBe("User cancelled ceremony");
    });
  });

  describe("registerPasskey", () => {
    it("returns an error if WebAuthn is not supported", async () => {
      delete (window as unknown as { PublicKeyCredential?: unknown }).PublicKeyCredential;
      const res = await registerPasskey();
      expect(res.data).toBeNull();
      expect(res.error?.message).toContain("not supported");
    });

    it("registers a new passkey credential successfully", async () => {
      (window as unknown as { PublicKeyCredential: unknown }).PublicKeyCredential = function () {};
      const mockClient = {
        auth: {
          registerPasskey: vi.fn().mockResolvedValue({
            data: { id: "passkey-uuid-1", name: "MacBook Touch ID" },
            error: null,
          }),
        },
      } as unknown as SupabaseClient;

      const res = await registerPasskey({ client: mockClient });
      expect(res.error).toBeNull();
      expect(res.data).toEqual({ id: "passkey-uuid-1", name: "MacBook Touch ID" });
    });
  });

  describe("listPasskeys & deletePasskey", () => {
    it("lists registered passkeys", async () => {
      const passkeysList = [
        { id: "pk-1", name: "iPhone Face ID" },
        { id: "pk-2", name: "YubiKey 5C" },
      ];
      const mockClient = {
        auth: {
          passkey: {
            list: vi.fn().mockResolvedValue({ data: passkeysList, error: null }),
            delete: vi.fn().mockResolvedValue({ error: null }),
          },
        },
      } as unknown as SupabaseClient;

      const listRes = await listPasskeys(mockClient);
      expect(listRes.passkeys).toEqual(passkeysList);
      expect(listRes.error).toBeNull();

      const delRes = await deletePasskey("pk-1", mockClient);
      expect(delRes.error).toBeNull();
      expect(mockClient.auth.passkey.delete).toHaveBeenCalledWith({ passkeyId: "pk-1" });
    });
  });
});
