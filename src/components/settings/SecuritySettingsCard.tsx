"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Smartphone,
  Fingerprint,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getMfaStatus, unenrollGoogleAuthenticator, MfaStatus } from "@/lib/auth/mfa";
import { registerPasskey } from "@/lib/auth/passkeys";
import { TotpEnrollmentModal } from "./TotpEnrollmentModal";

export function SecuritySettingsCard() {
  const [loading, setLoading] = React.useState(true);
  const [mfaStatus, setMfaStatus] = React.useState<MfaStatus | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = React.useState(false);

  const loadStatus = React.useCallback(async () => {
    setLoading(true);
    try {
      const status = await getMfaStatus();
      setMfaStatus(status);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleRemoveMfa = async (factorId: string) => {
    if (!window.confirm("Are you sure you want to remove Google Authenticator? Your account will revert to single-factor authentication.")) {
      return;
    }

    setIsRemoving(true);
    try {
      const res = await unenrollGoogleAuthenticator(factorId);
      if (res.success) {
        toast.success("Google Authenticator removed");
        await loadStatus();
      } else {
        toast.error(res.error || "Failed to remove Google Authenticator");
      }
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      const res = await registerPasskey({ name: "Workstation Passkey" });
      if (res.error) {
        toast.error(res.error.message || "Failed to register passkey");
      } else {
        toast.success("Biometric passkey registered successfully!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error registering passkey");
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  return (
    <>
      <Card className="p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#262220] shadow-2xs rounded-2xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#E05B27]" />
              <h2 className="text-base sm:text-lg font-serif font-medium text-[#24211F] dark:text-[#F3EFEA]">
                Two-Factor & Biometric Security
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7269] dark:text-[#A69E94]">
              Enforce multi-factor verification using Google Authenticator and manage biometric WebAuthn passkeys for your enclave.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#EDE7DE] dark:divide-[#262220] border-t border-b border-[#EDE7DE] dark:border-[#262220]">
          {/* 1. Google Authenticator TOTP Row */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#EDE7DE] dark:border-[#2A2624] text-[#E05B27] shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA]">
                    Google Authenticator
                  </span>
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin text-[#7A7269]" />
                  ) : mfaStatus?.enrolled ? (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px] font-mono gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Active (AAL2)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[#7A7269] border-[#EDE7DE] dark:border-[#2A2624] text-[10px] font-mono">
                      Not Configured
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94]">
                  Generates 6-digit rolling codes on your phone via the Google Authenticator app for sign-in verification.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {mfaStatus?.enrolled && mfaStatus.factors[0] ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isRemoving}
                  onClick={() => handleRemoveMfa(mfaStatus.factors[0].id)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/30 gap-1.5 h-8"
                >
                  {isRemoving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  <span>Remove</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="text-xs bg-[#E05B27] hover:bg-[#C94D1D] text-white gap-1.5 h-8 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Configure Google Authenticator</span>
                </Button>
              )}
            </div>
          </div>

          {/* 2. WebAuthn Passkeys Row */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#EDE7DE] dark:border-[#2A2624] text-[#2563EB] shrink-0">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA]">
                    Biometric Passkeys
                  </span>
                  <Badge variant="outline" className="text-blue-600 border-blue-500/30 text-[10px] font-mono">
                    FIDO2 / WebAuthn
                  </Badge>
                </div>
                <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94]">
                  Sign into your workstation instantly using Face ID, Touch ID, or Windows Hello.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRegisteringPasskey}
              onClick={handleRegisterPasskey}
              className="shrink-0 text-xs gap-1.5 h-8 border-[#EDE7DE] dark:border-[#2A2624]"
            >
              {isRegisteringPasskey ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              <span>Register Passkey</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* TOTP Enrollment Modal */}
      <TotpEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onSuccess={loadStatus}
      />
    </>
  );
}
