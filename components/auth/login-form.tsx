"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { FieldError } from "@/components/auth/field-error";
import { FormBanner } from "@/components/auth/form-banner";
import { useAuth } from "@/lib/auth/auth-context";
import { validateEmail, validatePassword } from "@/lib/validation/auth";
import { getErrorMessage, type FormattedError } from "@/lib/errors/messages";
import { logAuthError } from "@/lib/errors/logger";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithOtp, requestOtp, isAuthenticated, isLoading, isAdmin } = useAuth();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [otp, setOtp] = useState("");

  // Field error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Form submission state & general banner error (initialized with URL oauth error if present)
  const [bannerError, setBannerError] = useState<FormattedError | null>(() => {
    const oauthError = searchParams.get("error");
    if (!oauthError) return null;
    return { message: decodeURIComponent(oauthError.replace(/\+/g, " ")) };
  });
  const [submitting, setSubmitting] = useState(false);

  // Handle redirect if already authenticated
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const next = searchParams.get("next");
    if (isAdmin) {
      router.replace("/staff/login");
      return;
    }
    router.replace(next && next.startsWith("/app") ? next : "/app/dashboard");
  }, [isAdmin, isAuthenticated, isLoading, router, searchParams]);

  if (!isLoading && isAuthenticated) return null;

  // Real-time validation handlers
  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    const result = validatePassword(password);
    setPasswordError(result.error);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailTouched) {
      setEmailError(validateEmail(val));
    }
    setBannerError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordTouched) {
      const result = validatePassword(val);
      setPasswordError(result.error);
    }
    setBannerError(null);
  };

  // Determine if form is client-side valid
  const isEmailValid = validateEmail(email) === null;
  const isPasswordValid = validatePassword(password).valid;
  const isFormValid =
    mode === "password"
      ? isEmailValid && isPasswordValid
      : isEmailValid && (!otpSent || otp.trim().length > 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBannerError(null);

    // Force touch all fields
    setEmailTouched(true);
    setPasswordTouched(true);

    const emailErr = validateEmail(email);
    setEmailError(emailErr);

    if (mode === "password") {
      const passResult = validatePassword(password);
      setPasswordError(passResult.error);

      if (emailErr || !passResult.valid) {
        return;
      }
    } else if (emailErr) {
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "otp") {
        if (!otpSent) {
          await requestOtp(email.trim());
          setOtpSent(true);
        } else {
          await loginWithOtp(email.trim(), otp.trim());
        }
      } else {
        const totpClean = totp.trim().length > 0 ? totp.trim() : undefined;
        await login(email.trim(), password, totpClean);
      }
    } catch (err) {
      logAuthError(err, mode === "otp" ? "/users/auth/otp/" : "/users/auth/login/");
      const formatted = getErrorMessage(err);
      setBannerError(formatted);

      if (formatted.fieldErrors) {
        if (formatted.fieldErrors.email) setEmailError(formatted.fieldErrors.email);
        if (formatted.fieldErrors.password) setPasswordError(formatted.fieldErrors.password);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-2 text-sm text-mist">
        Enter your email and password to access your account.
      </p>

      {/* Mode Toggle: Password vs OTP */}
      <div className="mt-6 flex gap-2 rounded-lg border border-line bg-paper p-1">
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setOtpSent(false);
            setBannerError(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "password" ? "bg-white text-ink shadow-xs" : "text-mist hover:text-ink"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("otp");
            setOtpSent(false);
            setBannerError(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "otp" ? "bg-white text-ink shadow-xs" : "text-mist hover:text-ink"
          }`}
        >
          Email code
        </button>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        {/* Banner Error Display */}
        <FormBanner error={bannerError} onRetry={() => handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent<HTMLFormElement>)} />

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={submitting}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            className={`mt-1.5 ${
              emailError ? "border-coral-warn focus:border-coral-warn focus:ring-coral-warn/20" : ""
            }`}
            placeholder="you@company.com"
          />
          <FieldError id="email-error" error={emailError} />
        </div>

        {/* Password Mode Fields */}
        {mode === "password" ? (
          <>
            <PasswordField
              id="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={handlePasswordBlur}
              error={passwordError}
              disabled={submitting}
            />

            <div>
              <label htmlFor="totp" className="block text-sm font-medium text-ink">
                2FA code <span className="font-normal text-mist">(if enabled)</span>
              </label>
              <Input
                id="totp"
                name="totp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={submitting}
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                className="mt-1.5 font-mono"
                placeholder="000000"
              />
            </div>
          </>
        ) : otpSent ? (
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-ink">
              Verification code
            </label>
            <Input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              required
              disabled={submitting}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1.5 font-mono"
              placeholder="123456"
            />
          </div>
        ) : null}

        {/* Forgot Password Link */}
        <div className="flex items-center justify-between gap-4">
          {mode === "password" ? (
            <Link href="/reset-password" className="text-sm font-medium text-sky hover:underline">
              Forgot your password?
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={submitting || !isFormValid}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Please wait…
            </span>
          ) : mode === "otp" ? (
            otpSent ? (
              "Verify code"
            ) : (
              "Send code"
            )
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-mist">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-sky hover:underline">
          Register now
        </Link>
      </p>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
