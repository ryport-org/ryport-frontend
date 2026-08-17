"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/auth/field-error";
import { FormBanner } from "@/components/auth/form-banner";
import { useAuth } from "@/lib/auth/auth-context";
import { businessesApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/tokens";
import { getErrorMessage, type FormattedError } from "@/lib/errors/messages";
import { logAuthError } from "@/lib/errors/logger";

const BUSINESS_TYPES = [
  { id: "sole_proprietorship", label: "Sole Proprietorship / Enterprise" },
  { id: "limited_liability", label: "Limited Liability Company (LTD)" },
  { id: "partnership", label: "Partnership" },
  { id: "agency", label: "Agency / Studio" },
  { id: "other", label: "Other / Unregistered Business" },
];

export function OnboardingBusinessForm() {
  const router = useRouter();
  const { bootstrap } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("sole_proprietorship");
  const [currency, setCurrency] = useState("NGN");

  const [nameError, setNameError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const [bannerError, setBannerError] = useState<FormattedError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validateName = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return "Business name is required";
    if (trimmed.length > 100) return "Business name cannot exceed 100 characters";
    return null;
  };

  const handleNameChange = (val: string) => {
    setBusinessName(val);
    if (touched) setNameError(validateName(val));
    setBannerError(null);
  };

  const handleNameBlur = () => {
    setTouched(true);
    setNameError(validateName(businessName));
  };

  const isFormValid = validateName(businessName) === null && businessType.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBannerError(null);
    setTouched(true);

    const err = validateName(businessName);
    setNameError(err);
    if (err) return;

    setSubmitting(true);

    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Create business via POST /api/v1/businesses/ with both type and entity_type for compatibility
      const newBiz = await businessesApi.create(token, {
        name: businessName.trim(),
        type: businessType,
        entity_type: businessType,
        currency,
      });

      // Auto-switch to activate the newly created business on backend
      if (newBiz && newBiz.id) {
        await businessesApi.switch(token, newBiz.id).catch(() => {});
      }

      // Refetch context & bootstrap to confirm SME active_business setup
      await bootstrap(token);

      // Redirect to dashboard
      router.push("/app/dashboard");
    } catch (err) {
      logAuthError(err, "/businesses/");
      const formatted = getErrorMessage(err);
      setBannerError(formatted);

      if (formatted.fieldErrors?.name) {
        setNameError(formatted.fieldErrors.name);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-sky">Step 3 of 3</span>
        <h1 className="mt-1 font-display text-3xl text-ink">Set up your business</h1>
        <p className="mt-2 text-sm text-mist">
          Tell us about your organization to unlock dedicated business analytics, multi-user permissions, and CFO insights.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <FormBanner error={bannerError} onRetry={() => handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent<HTMLFormElement>)} />

        {/* Business Name */}
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-ink">
            Business or Trade Name
          </label>
          <Input
            id="business_name"
            name="business_name"
            type="text"
            required
            disabled={submitting}
            value={businessName}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleNameBlur}
            aria-invalid={Boolean(nameError)}
            className={`mt-1.5 ${nameError ? "border-coral-warn focus:border-coral-warn focus:ring-coral-warn/20" : ""}`}
            placeholder="e.g. Acme Global Logistics Ltd"
          />
          <FieldError error={nameError} />
        </div>

        {/* Business Type */}
        <div>
          <label htmlFor="business_type" className="block text-sm font-medium text-ink">
            Entity Type
          </label>
          <select
            id="business_type"
            name="business_type"
            disabled={submitting}
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-sky focus:ring-2 focus:ring-sky/20 disabled:bg-paper"
          >
            {BUSINESS_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Operating Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-ink">
            Primary Currency
          </label>
          <select
            id="currency"
            name="currency"
            disabled={submitting}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-sky focus:ring-2 focus:ring-sky/20 disabled:bg-paper"
          >
            <option value="NGN">NGN (₦ — Nigerian Naira)</option>
            <option value="USD">USD ($ — US Dollar)</option>
            <option value="GBP">GBP (£ — British Pound)</option>
            <option value="EUR">EUR (€ — Euro)</option>
          </select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="mt-2 w-full"
          disabled={submitting || !isFormValid}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating business…
            </span>
          ) : (
            "Complete setup & enter dashboard"
          )}
        </Button>
      </form>
    </div>
  );
}
