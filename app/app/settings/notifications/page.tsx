"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/tokens";
import { notificationsApi } from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function NotificationSettingsPage() {
  const [supported, setSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkState() {
      if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
        setSupported(false);
        setLoading(false);
        return;
      }

      setPermission(Notification.permission);

      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(Boolean(sub));
      } catch {
        // Service worker might not be registered yet
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    }

    checkState();
  }, []);

  async function handleToggle() {
    const token = getAccessToken();
    if (!token) {
      setError("Please log in to manage notification settings.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setToggling(true);

    try {
      if (isSubscribed) {
        // Toggle OFF: Unsubscribe
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          try {
            await notificationsApi.unsubscribePush(token, { endpoint: sub.endpoint });
          } catch {
            // Still proceed to unsubscribe locally
          }
          await sub.unsubscribe();
        }
        setIsSubscribed(false);
        setSuccessMessage("Browser notifications disabled.");
      } else {
        // Toggle ON: Request permission and subscribe
        const perm = await Notification.requestPermission();
        setPermission(perm);

        if (perm === "denied") {
          setError(
            "Notifications are blocked in your browser settings. Please click the lock icon in your URL bar and allow notifications for this site.",
          );
          setToggling(false);
          return;
        }

        if (perm !== "granted") {
          setToggling(false);
          return;
        }

        // Register service worker if needed
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
          });
        }

        const subJson = sub.toJSON();
        const payload = {
          endpoint: sub.endpoint,
          p256dh: subJson.keys?.p256dh || "",
          auth: subJson.keys?.auth || "",
        };

        await notificationsApi.subscribePush(token, payload);
        setIsSubscribed(true);
        setSuccessMessage("Browser push notifications successfully enabled!");
      }
    } catch (err) {
      setError(getAuthErrorMessage(err) || "Failed to update notification settings.");
    } finally {
      setToggling(false);
    }
  }

  return (
    <AppPage>
      <AppHeader
        title="Notification Settings"
        description="Manage push notifications and delivery preferences."
      />

      <AppPageBody>
        <AppPageContent>
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Status alerts */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-coral-warn/20 bg-coral-warn/5 p-4 text-xs text-coral-warn">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-700">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {!supported ? (
              <Card className="p-6 text-center">
                <Smartphone className="size-8 text-mist mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-ink">
                  Push Notifications Not Supported
                </h3>
                <p className="mt-1 text-xs text-mist max-w-sm mx-auto">
                  Your current browser or device does not support Web Push notifications.
                </p>
              </Card>
            ) : (
              <Card className="divide-y divide-line">
                <CardHeader className="py-4">
                  <h2 className="text-sm font-semibold text-ink">Alert Channels</h2>
                </CardHeader>

                <CardBody className="p-6 space-y-6">
                  {/* Browser Notifications Toggle Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bell className="size-4 text-sky" />
                        <h3 className="text-sm font-semibold text-ink">
                          Browser Notifications
                        </h3>
                      </div>
                      <p className="text-xs text-mist">
                        Get real-time alerts even when Ryport isn&apos;t open.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isSubscribed}
                        disabled={loading || toggling}
                        onClick={handleToggle}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2 disabled:opacity-50 ${
                          isSubscribed ? "bg-emerald-600" : "bg-line"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isSubscribed ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>

                      <span className="text-xs font-medium text-ink w-16">
                        {toggling
                          ? "Saving…"
                          : isSubscribed
                            ? "Enabled"
                            : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Browser Permission State Guidance */}
                  {permission === "denied" && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 space-y-1">
                      <p className="font-semibold">Browser Permission Blocked</p>
                      <p className="text-amber-800 leading-relaxed">
                        You have blocked notification requests for Ryport in your browser settings. To receive alerts, open your browser site settings and allow Notifications.
                      </p>
                    </div>
                  )}

                  {isSubscribed && (
                    <div className="rounded-xl bg-paper/60 p-4 border border-line space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        <span>Active Alert Triggers</span>
                      </div>
                      <ul className="text-xs text-mist space-y-1 pl-6 list-disc">
                        <li>Budget threshold breaches (80% and 100% caps)</li>
                        <li>Automated SMS bank alert ingest confirmations</li>
                        <li>Critical cash flow and low-runway warnings</li>
                      </ul>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
