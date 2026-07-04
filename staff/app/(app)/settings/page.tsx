"use client";

import { useEffect, useState } from "react";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffAuthErrorMessage, useStaffAuth } from "@/lib/auth/auth-context";

export default function SettingsPage() {
  const { staffUser, updateDepartment } = useStaffAuth();
  const [department, setDepartment] = useState(staffUser?.department ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDepartment(staffUser?.department ?? "");
  }, [staffUser?.department]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await updateDepartment(department.trim());
      setMessage("Profile updated.");
    } catch (err) {
      setError(getStaffAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Your staff profile" />
      <PageBody>
        <Card className="max-w-md">
          <CardBody>
            <form className="space-y-4" onSubmit={(e) => void handleSave(e)}>
              <div>
                <label className="block text-sm font-medium text-ink">Email</label>
                <p className="mt-1 text-sm text-muted">{staffUser?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Role</label>
                <p className="mt-1 text-sm capitalize text-muted">{staffUser?.role}</p>
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-ink">
                  Department
                </label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              {message ? <p className="text-sm text-success">{message}</p> : null}
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </PageBody>
    </>
  );
}
