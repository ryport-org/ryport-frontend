"use client";

import { useEffect, useState } from "react";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { Button } from "@/components/staff/ui/button";
import { Card, CardBody } from "@/components/staff/ui/card";
import { Input } from "@/components/staff/ui/input";
import { staffAuthApi } from "@/lib/staff/api";
import { getStaffAuthErrorMessage, useStaffAuth } from "@/lib/staff/auth/auth-context";
import { getStaffAccessToken } from "@/lib/staff/auth/tokens";

export default function SettingsPage() {
  const { staffUser, updateDepartment } = useStaffAuth();
  const [department, setDepartment] = useState(staffUser?.department ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDepartment(staffUser?.department ?? "");
  }, [staffUser?.department]);

  async function handleSaveProfile(e: React.FormEvent) {
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

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const token = getStaffAccessToken();
    if (!token) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await staffAuthApi.changePassword(
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        token,
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed. You may need to sign in again on other devices.");
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
        <div className="grid max-w-lg gap-6">
          <Card>
            <CardBody>
              <form className="space-y-4" onSubmit={(e) => void handleSaveProfile(e)}>
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
                <Button type="submit" disabled={loading}>
                  Save profile
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <form className="space-y-4" onSubmit={(e) => void handleChangePassword(e)}>
                <h2 className="text-sm font-semibold text-ink">Change password</h2>
                <Input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Button type="submit" variant="secondary" disabled={loading}>
                  Update password
                </Button>
              </form>
            </CardBody>
          </Card>

          {message ? <p className="text-sm text-success">{message}</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      </PageBody>
    </>
  );
}
