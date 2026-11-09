"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Shield,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export interface DeviceSession {
  id: string;
  sessionId: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress?: string;
  isTrusted: boolean;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export function DeviceManagementCard() {
  const [sessions, setSessions] = React.useState<DeviceSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = React.useState(false);

  const fetchSessions = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/sessions");
      const json = await res.json();
      if (res.ok && json.data?.sessions) {
        setSessions(json.data.sessions);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSingle = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to revoke this session? The device will be immediately signed out.")) {
      return;
    }

    setRevokingId(sessionId);
    try {
      const res = await fetch("/api/v1/auth/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", sessionId }),
      });

      if (res.ok) {
        toast.success("Device session revoked");
        await fetchSessions();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to revoke session");
      }
    } catch {
      toast.error("Network error revoking session");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOthers = async () => {
    if (!window.confirm("Revoke all other active workstation sessions? You will stay signed in only on this device.")) {
      return;
    }

    setIsRevokingAll(true);
    try {
      const res = await fetch("/api/v1/auth/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_others" }),
      });

      if (res.ok) {
        toast.success("All other sessions revoked");
        await fetchSessions();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to revoke other sessions");
      }
    } catch {
      toast.error("Network error revoking sessions");
    } finally {
      setIsRevokingAll(false);
    }
  };

  const getDeviceIcon = (os: string) => {
    const lower = os.toLowerCase();
    if (lower.includes("ios") || lower.includes("iphone") || lower.includes("android")) {
      return <Smartphone className="h-5 w-5 text-[#E05B27]" />;
    }
    if (lower.includes("ipad") || lower.includes("tablet")) {
      return <Tablet className="h-5 w-5 text-[#2563EB]" />;
    }
    if (lower.includes("mac")) {
      return <Laptop className="h-5 w-5 text-[#7A7269]" />;
    }
    return <Monitor className="h-5 w-5 text-[#2563EB]" />;
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <Card className="p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#262220] shadow-2xs rounded-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#2563EB]" />
            <h2 className="text-base sm:text-lg font-serif font-medium text-[#24211F] dark:text-[#F3EFEA]">
              Device & Workstation Sessions
            </h2>
            <Badge variant="outline" className="text-xs font-mono border-[#EDE7DE] dark:border-[#2A2624]">
              {sessions.length} Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#7A7269] dark:text-[#A69E94]">
            Manage authorized computers, phones, and browsers connected to your Personal OS enclave.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchSessions}
            disabled={loading}
            className="h-8 w-8 p-0 text-[#7A7269] hover:text-[#24211F] dark:hover:text-[#F3EFEA]"
            aria-label="Refresh sessions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {otherSessionsCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRevokingAll}
              onClick={handleRevokeOthers}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/30 gap-1.5 h-8"
            >
              {isRevokingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              <span>Revoke All Others</span>
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-[#EDE7DE] dark:divide-[#262220] border-t border-b border-[#EDE7DE] dark:border-[#262220]">
        {loading && sessions.length === 0 ? (
          <div className="py-8 flex justify-center items-center gap-2 text-xs text-[#7A7269]">
            <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
            <span>Loading active sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#7A7269]">
            No recorded workstation sessions.
          </div>
        ) : (
          sessions.map((session) => {
            const formattedTime = (() => {
              try {
                return formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true });
              } catch {
                return "recently";
              }
            })();

            return (
              <div
                key={session.sessionId || session.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#EDE7DE] dark:border-[#2A2624] shrink-0 mt-0.5">
                    {getDeviceIcon(session.os)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-[#24211F] dark:text-[#F3EFEA]">
                        {session.deviceName || `${session.os} (${session.browser})`}
                      </span>
                      {session.isCurrent && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px] font-mono gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Current Device
                        </Badge>
                      )}
                      {session.isTrusted && (
                        <Badge variant="outline" className="text-blue-600 border-blue-500/30 text-[10px] font-mono">
                          Trusted (30d)
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#7A7269] dark:text-[#A69E94] flex-wrap">
                      <span>{session.browser}</span>
                      <span>•</span>
                      <span>{session.os}</span>
                      {session.ipAddress && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{session.ipAddress}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Last active {formattedTime}</span>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={revokingId === session.sessionId}
                    onClick={() => handleRevokeSingle(session.sessionId)}
                    className="self-start sm:self-auto text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/30 gap-1.5 h-8 shrink-0"
                  >
                    {revokingId === session.sessionId ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    <span>Revoke</span>
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
