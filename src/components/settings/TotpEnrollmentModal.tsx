"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  enrollGoogleAuthenticator,
  verifyMfaChallenge,
  generateRecoveryCodes,
  saveRecoveryCodes,
  TotpEnrollmentData,
} from "@/lib/auth/mfa";
import {
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Loader2,
  X,
  Smartphone,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface TotpEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TotpEnrollmentModal({
  isOpen,
  onClose,
  onSuccess,
}: TotpEnrollmentModalProps) {
  const [step, setStep] = React.useState<"enroll" | "verify" | "recovery">("enroll");
  const [loading, setLoading] = React.useState(false);
  const [enrollData, setEnrollData] = React.useState<TotpEnrollmentData | null>(null);
  const [verificationCode, setVerificationCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = React.useState(false);
  const [copiedCodes, setCopiedCodes] = React.useState(false);
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[]>([]);
  const [savedCodesConfirmed, setSavedCodesConfirmed] = React.useState(false);

  // Initialize enrollment on modal open
  React.useEffect(() => {
    if (!isOpen) {
      setStep("enroll");
      setEnrollData(null);
      setVerificationCode("");
      setError(null);
      setRecoveryCodes([]);
      setSavedCodesConfirmed(false);
      return;
    }

    let isMounted = true;
    async function startEnrollment() {
      setLoading(true);
      setError(null);
      const res = await enrollGoogleAuthenticator();
      if (!isMounted) return;

      if (res.error || !res.data) {
        setError(res.error || "Failed to start Google Authenticator enrollment");
      } else {
        setEnrollData(res.data);
      }
      setLoading(false);
    }

    startEnrollment();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySecret = async () => {
    if (!enrollData?.secret) return;
    await navigator.clipboard.writeText(enrollData.secret);
    setCopiedSecret(true);
    toast.success("Secret key copied to clipboard");
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyCodes = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCodes(true);
    toast.success("Recovery backup codes copied");
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDownloadCodes = () => {
    const text = [
      "PERSONAL OS — EMERGENCY MFA RECOVERY CODES",
      "Created: " + new Date().toISOString(),
      "Owner Enclave: 321arifali@gmail.com",
      "------------------------------------------",
      "Each code is valid for single-use when Google Authenticator is unavailable.",
      "",
      ...recoveryCodes.map((code, idx) => `${idx + 1}. ${code}`),
      "------------------------------------------",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "personal-os-recovery-codes.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Recovery codes downloaded");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollData || !verificationCode) return;

    setError(null);
    setLoading(true);

    const res = await verifyMfaChallenge(enrollData.factorId, verificationCode);
    if (!res.success) {
      setError(res.error || "Invalid 6-digit code. Please verify against Google Authenticator.");
      setLoading(false);
      return;
    }

    // Factor verified! Now generate & persist recovery codes
    const codes = generateRecoveryCodes(8);
    setRecoveryCodes(codes);
    await saveRecoveryCodes(codes);

    setStep("recovery");
    setLoading(false);
    toast.success("Google Authenticator verified successfully!");
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  // Convert SVG string to src if needed
  const getQrSrc = (qr: string) => {
    if (qr.startsWith("data:") || qr.startsWith("http")) return qr;
    if (qr.startsWith("<svg")) return `data:image/svg+xml;utf8,${encodeURIComponent(qr)}`;
    return qr;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="totp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <Card className="relative w-full max-w-lg p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#262220] shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#7A7269] hover:text-[#24211F] dark:hover:text-[#F3EFEA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#EDE7DE] dark:border-[#262220]">
          <div className="p-2 rounded-xl bg-[#E05B27]/10 text-[#E05B27]">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="totp-modal-title"
              className="text-base font-serif font-medium text-[#24211F] dark:text-[#F3EFEA]"
            >
              Google Authenticator Setup
            </h2>
            <p className="text-xs text-[#7A7269] dark:text-[#A69E94]">
              {step === "recovery"
                ? "Step 2 of 2: Save emergency recovery backup codes"
                : "Step 1 of 2: Link Google Authenticator app"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-900 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Scan & Verify */}
        {step !== "recovery" && (
          <div className="mt-4 space-y-5">
            {loading && !enrollData ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#E05B27]" />
                <p className="text-xs text-[#7A7269] dark:text-[#A69E94]">
                  Generating Google Authenticator key...
                </p>
              </div>
            ) : enrollData ? (
              <>
                {/* Instructions */}
                <ol className="text-xs text-[#5C554E] dark:text-[#A69E94] space-y-1.5 list-decimal list-inside bg-[#FAF8F5] dark:bg-[#1A1715] p-3 rounded-xl border border-[#EDE7DE] dark:border-[#2A2624]">
                  <li>Open the <strong>Google Authenticator</strong> app on your smartphone.</li>
                  <li>Tap the <strong>+</strong> button in the bottom corner and tap <strong>Scan a QR code</strong>.</li>
                  <li>Point your phone camera at the QR code below.</li>
                </ol>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#EDE7DE] shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getQrSrc(enrollData.qrCode)}
                    alt="Google Authenticator QR Code"
                    className="w-48 h-48 object-contain"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-2">
                    Issuer: Personal OS (321arifali@gmail.com)
                  </span>
                </div>

                {/* Manual Key Fallback */}
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-[#7A7269] dark:text-[#A69E94]">
                    Unable to scan? Enter setup key manually:
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 text-xs font-mono bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#EDE7DE] dark:border-[#2A2624] rounded-lg tracking-wider select-all text-[#24211F] dark:text-[#F3EFEA]">
                      {enrollData.secret}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopySecret}
                      className="shrink-0 h-8 gap-1.5 text-xs border-[#EDE7DE] dark:border-[#2A2624]"
                    >
                      {copiedSecret ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedSecret ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                </div>

                {/* Verification Form */}
                <form onSubmit={handleVerify} className="space-y-3 pt-2 border-t border-[#EDE7DE] dark:border-[#262220]">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="verification-code-input"
                      className="text-xs font-medium text-[#24211F] dark:text-[#F3EFEA] flex items-center gap-1.5"
                    >
                      <KeyRound className="h-3.5 w-3.5 text-[#E05B27]" />
                      <span>Enter 6-digit code from Google Authenticator</span>
                    </label>
                    <input
                      id="verification-code-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoComplete="one-time-code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="000000"
                      required
                      className="w-full text-center text-lg font-mono tracking-widest px-3 py-2.5 rounded-lg border border-[#EDE7DE] dark:border-[#2A2624] bg-white dark:bg-[#1A1715] text-[#24211F] dark:text-[#F3EFEA] focus:outline-none focus:ring-1 focus:ring-[#E05B27]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="text-xs border-[#EDE7DE] dark:border-[#2A2624]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || verificationCode.length !== 6}
                      className="text-xs bg-[#E05B27] hover:bg-[#C94D1D] text-white gap-1.5"
                    >
                      {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      <span>Verify & Activate</span>
                    </Button>
                  </div>
                </form>
              </>
            ) : null}
          </div>
        )}

        {/* STEP 2: Emergency Recovery Codes */}
        {step === "recovery" && (
          <div className="mt-4 space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Save Your Emergency Recovery Codes</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                If you ever lose or replace your phone, these single-use codes are your only way to regain access to your Personal OS. We do not store unhashed copies.
              </p>
            </div>

            {/* Codes Grid */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAF8F5] dark:bg-[#1A1715] rounded-xl border border-[#EDE7DE] dark:border-[#2A2624]">
              {recoveryCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="font-mono text-xs text-center py-1.5 px-2 bg-white dark:bg-[#161413] rounded border border-[#EDE7DE] dark:border-[#262220] tracking-wider text-[#24211F] dark:text-[#F3EFEA]"
                >
                  <span className="text-[10px] text-[#A69E94] mr-1.5 select-none">{idx + 1}.</span>
                  {code}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyCodes}
                className="flex-1 text-xs gap-1.5 border-[#EDE7DE] dark:border-[#2A2624]"
              >
                {copiedCodes ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedCodes ? "Codes Copied" : "Copy Codes"}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadCodes}
                className="flex-1 text-xs gap-1.5 border-[#EDE7DE] dark:border-[#2A2624]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download (.txt)</span>
              </Button>
            </div>

            {/* Checkbox confirmation */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="confirm-saved-codes"
                checked={savedCodesConfirmed}
                onChange={(e) => setSavedCodesConfirmed(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#EDE7DE] text-[#E05B27] focus:ring-[#E05B27] accent-[#E05B27] cursor-pointer"
              />
              <label
                htmlFor="confirm-saved-codes"
                className="text-[11px] text-[#7A7269] dark:text-[#A69E94] cursor-pointer select-none"
              >
                I have securely saved these emergency recovery codes
              </label>
            </div>

            <Button
              type="button"
              disabled={!savedCodesConfirmed}
              onClick={handleFinish}
              className="w-full text-xs font-medium h-9 bg-[#E05B27] hover:bg-[#C94D1D] text-white gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Complete Setup</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
