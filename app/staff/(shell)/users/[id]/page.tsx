"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { Badge } from "@/components/staff/ui/badge";
import { Button } from "@/components/staff/ui/button";
import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";
import { Input } from "@/components/staff/ui/input";
import { staffUsersApi } from "@/lib/staff/api";
import type { CustomerUserDetail, UserNote } from "@/lib/staff/api/types";
import { getStaffAuthErrorMessage, useStaffAuth } from "@/lib/staff/auth/auth-context";
import { getStaffAccessToken } from "@/lib/staff/auth/tokens";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useStaffAuth();
  const [user, setUser] = useState<CustomerUserDetail | null>(null);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    const token = getStaffAccessToken();
    if (!token || !id) return;
    setLoading(true);
    setError("");
    try {
      const [detail, userNotes] = await Promise.all([
        staffUsersApi.getUser(id, token),
        staffUsersApi.listUserNotes(id, token).catch(() => []),
      ]);
      setUser(detail);
      setNotes(userNotes);
    } catch {
      setError("Could not load user.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(fn: () => Promise<void>) {
    setActionError("");
    try {
      await fn();
      await load();
    } catch (err) {
      setActionError(getStaffAuthErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title={user?.email_masked ?? "User detail"}
        description="Account stats and support actions"
      />
      <PageBody>
        {error ? <ApiErrorBanner message={error} onRetry={() => void load()} /> : null}
        {actionError ? <p className="mb-4 text-sm text-danger">{actionError}</p> : null}

        {loading ? (
          <LoadingGrid count={1} height="h-48" />
        ) : user ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {can("can_suspend_users") ? (
                user.is_suspended ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void runAction(async () => {
                        const t = getStaffAccessToken();
                        if (t) await staffUsersApi.unsuspendUser(id, t);
                      })
                    }
                  >
                    Unsuspend
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      void runAction(async () => {
                        const t = getStaffAccessToken();
                        if (t) await staffUsersApi.suspendUser(id, t);
                      })
                    }
                  >
                    Suspend
                  </Button>
                )
              ) : null}
              {can("can_suspend_users") ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    void runAction(async () => {
                      const t = getStaffAccessToken();
                      if (t) await staffUsersApi.resetUserPassword(id, t);
                    })
                  }
                >
                  Send password reset
                </Button>
              ) : null}
              {can("can_change_plans") ? (
                <>
                  {(["free", "pro", "advanced"] as const).map((plan) => (
                    <Button
                      key={plan}
                      type="button"
                      variant="ghost"
                      disabled={user.plan === plan}
                      onClick={() =>
                        void runAction(async () => {
                          const t = getStaffAccessToken();
                          if (t) await staffUsersApi.changeUserPlan(id, plan, t);
                        })
                      }
                    >
                      Set {plan}
                    </Button>
                  ))}
                </>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardBody>
                  <p className="text-xs text-muted">Plan</p>
                  <p className="mt-1 font-semibold capitalize text-ink">{user.plan}</p>
                  {user.is_suspended ? <Badge variant="danger" className="mt-2">Suspended</Badge> : null}
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-muted">Transactions</p>
                  <p className="mt-1 tabular-nums text-xl font-semibold">{user.stats.total_transactions}</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-muted">Bank accounts</p>
                  <p className="mt-1 tabular-nums text-xl font-semibold">{user.stats.total_bank_accounts}</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-muted">AI messages</p>
                  <p className="mt-1 tabular-nums text-xl font-semibold">
                    {user.stats.total_ai_messages_lifetime}
                  </p>
                </CardBody>
              </Card>
            </div>

            {user.activity_timeline && user.activity_timeline.length > 0 ? (
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-ink">Activity</h2>
                </CardHeader>
                <CardBody className="pt-0">
                  <ul className="divide-y divide-border">
                    {user.activity_timeline.map((item, i) => (
                      <li key={i} className="flex justify-between py-2 text-sm">
                        <span className="capitalize text-ink">{item.event.replace(/_/g, " ")}</span>
                        <span className="text-muted">{new Date(item.timestamp).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-ink">Support notes</h2>
              </CardHeader>
              <CardBody className="space-y-4 pt-0">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void runAction(async () => {
                      const t = getStaffAccessToken();
                      if (t && noteText.trim()) {
                        await staffUsersApi.addUserNote(id, noteText.trim(), t);
                        setNoteText("");
                      }
                    });
                  }}
                >
                  <Input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note…"
                    className="flex-1"
                  />
                  <Button type="submit">Add</Button>
                </form>
                {notes.length === 0 ? (
                  <p className="text-sm text-muted">No notes yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {notes.map((note) => (
                      <li key={note.id} className="rounded-md border border-border p-3 text-sm">
                        <p className="text-ink">{note.body}</p>
                        <p className="mt-1 text-xs text-muted">
                          {note.author_role ?? "staff"} · {new Date(note.created_at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        ) : null}
      </PageBody>
    </>
  );
}
