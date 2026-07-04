"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { PaginationBar } from "@/components/staff/shared/pagination";
import { Badge } from "@/components/staff/ui/badge";
import { Button } from "@/components/staff/ui/button";
import { Card, CardBody } from "@/components/staff/ui/card";
import { Input } from "@/components/staff/ui/input";
import { staffUsersApi } from "@/lib/staff/api";
import type { CustomerUserListItem, Paginated } from "@/lib/staff/api/types";
import { getStaffAccessToken } from "@/lib/staff/auth/tokens";
import { staffPath } from "@/lib/staff/routes";

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Paginated<CustomerUserListItem> | null>(null);

  const load = useCallback(async () => {
    const token = getStaffAccessToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await staffUsersApi.listUsers(
        { q: q || undefined, plan: plan || undefined, page, sort: "signup_date" },
        token,
      );
      setData(result);
    } catch {
      setError("Could not load users.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [q, plan, page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader title="Users" description="Search and manage customer accounts" />
      <PageBody>
        <Card className="mb-6">
          <CardBody className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Search email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="sm:max-w-xs"
            />
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="min-h-9 rounded-md border border-border bg-bg px-3 text-sm"
            >
              <option value="">All plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="advanced">Advanced</option>
            </select>
            <Button
              type="button"
              onClick={() => {
                setPage(1);
                void (async () => {
                  const token = getStaffAccessToken();
                  if (!token) return;
                  setLoading(true);
                  setError("");
                  try {
                    const result = await staffUsersApi.listUsers(
                      { q: q || undefined, plan: plan || undefined, page: 1, sort: "signup_date" },
                      token,
                    );
                    setData(result);
                  } catch {
                    setError("Could not load users.");
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
            >
              Search
            </Button>
          </CardBody>
        </Card>

        {error ? <ApiErrorBanner message={error} onRetry={() => void load()} /> : null}

        {loading ? (
          <LoadingGrid count={1} height="h-64" />
        ) : data && data.results.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Signed up</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-ink">{user.email_masked}</td>
                      <td className="px-4 py-3 capitalize">{user.plan_badge ?? user.plan}</td>
                      <td className="px-4 py-3">
                        {user.is_suspended ? (
                          <Badge variant="danger">Suspended</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(user.signed_up_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={staffPath(`/users/${user.id}`)}
                          className="text-sm font-medium text-accent hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CardBody className="border-t border-border pt-0">
              <PaginationBar
                page={data.page}
                totalPages={data.total_pages}
                onPage={setPage}
              />
            </CardBody>
          </Card>
        ) : !error ? (
          <p className="text-sm text-muted">No users found.</p>
        ) : null}
      </PageBody>
    </>
  );
}
