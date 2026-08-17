"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { FieldError } from "@/components/auth/field-error";
import { FormBanner } from "@/components/auth/form-banner";
import { useAuth } from "@/lib/auth/auth-context";
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "@/lib/validation/auth";
import { getErrorMessage, type FormattedError } from "@/lib/errors/messages";
import { logAuthError } from "@/lib/errors/logger";

export function RegisterForm() {
  const { registerUser } = useAuth();

  // Form values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Field error states
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Field touch tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Banner error and submit state
  const [bannerError, setBannerError] = useState<FormattedError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Field validation helpers
  const passwordResult = validatePassword(password);

  const checkFirstName = (val: string) => validateName(val, "First name");
  const checkLastName = (val: string) => validateName(val, "Last name");
  const checkEmail = (val: string) => validateEmail(val);
  const checkPhone = (val: string) => validatePhone(val);
  const checkConfirmPassword = (pass: string, conf: string) => validateConfirmPassword(pass, conf);

  // Blur handlers
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "firstName") setFirstNameError(checkFirstName(firstName));
    if (field === "lastName") setLastNameError(checkLastName(lastName));
    if (field === "email") setEmailError(checkEmail(email));
    if (field === "phone") setPhoneError(checkPhone(phone));
    if (field === "password") setPasswordError(passwordResult.error);
    if (field === "confirmPassword") setConfirmPasswordError(checkConfirmPassword(password, confirmPassword));
  };

  // Change handlers with live validation once touched
  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    if (touched.firstName) setFirstNameError(checkFirstName(val));
    setBannerError(null);
  };

  const handleLastNameChange = (val: string) => {
    setLastName(val);
    if (touched.lastName) setLastNameError(checkLastName(val));
    setBannerError(null);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (touched.email) setEmailError(checkEmail(val));
    setBannerError(null);
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (touched.phone) setPhoneError(checkPhone(val));
    setBannerError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    const res = validatePassword(val);
    if (touched.password || /\s/.test(val)) setPasswordError(res.error);
    if (touched.confirmPassword || confirmPassword) {
      setConfirmPasswordError(checkConfirmPassword(val, confirmPassword));
    }
    setBannerError(null);
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (touched.confirmPassword || val.length > 0) {
      setConfirmPasswordError(checkConfirmPassword(password, val));
    }
    setBannerError(null);
  };

  // Overall form validity check for submit button
  const isFirstNameValid = checkFirstName(firstName) === null;
  const isLastNameValid = checkLastName(lastName) === null;
  const isEmailValid = checkEmail(email) === null;
  const isPhoneValid = checkPhone(phone) === null;
  const isPasswordValid = passwordResult.valid;
  const isConfirmValid = checkConfirmPassword(password, confirmPassword) === null;

  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isPasswordValid &&
    isConfirmValid;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBannerError(null);

    // Touch all fields
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    const fnErr = checkFirstName(firstName);
    const lnErr = checkLastName(lastName);
    const emErr = checkEmail(email);
    const phErr = checkPhone(phone);
    const pwErr = passwordResult.error;
    const cpwErr = checkConfirmPassword(password, confirmPassword);

    setFirstNameError(fnErr);
    setLastNameError(lnErr);
    setEmailError(emErr);
    setPhoneError(phErr);
    setPasswordError(pwErr);
    setConfirmPasswordError(cpwErr);

    if (fnErr || lnErr || emErr || phErr || pwErr || cpwErr) {
      return;
    }

    setSubmitting(true);

    try {
      await registerUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        password,
        password_confirm: confirmPassword,
      });
    } catch (err) {
      logAuthError(err, "/users/auth/register/");
      const formatted = getErrorMessage(err);
      setBannerError(formatted);

      if (formatted.fieldErrors) {
        if (formatted.fieldErrors.first_name) setFirstNameError(formatted.fieldErrors.first_name);
        if (formatted.fieldErrors.last_name) setLastNameError(formatted.fieldErrors.last_name);
        if (formatted.fieldErrors.email) setEmailError(formatted.fieldErrors.email);
        if (formatted.fieldErrors.phone_number) setPhoneError(formatted.fieldErrors.phone_number);
        if (formatted.fieldErrors.password) setPasswordError(formatted.fieldErrors.password);
        if (formatted.fieldErrors.password_confirm) setConfirmPasswordError(formatted.fieldErrors.password_confirm);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-mist">
        Start free — track revenue, monitor cash flow, and get AI guidance in minutes.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Banner Error */}
        <FormBanner error={bannerError} onRetry={() => handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent<HTMLFormElement>)} />

        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-ink">
              First name
            </label>
            <Input
              id="first_name"
              name="first_name"
              type="text"
              required
              disabled={submitting}
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              onBlur={() => handleBlur("firstName")}
              aria-invalid={Boolean(firstNameError)}
              className={`mt-1.5 ${firstNameError ? "border-coral-warn focus:border-coral-warn focus:ring-coral-warn/20" : ""}`}
              placeholder="Amina"
            />
            <FieldError error={firstNameError} />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-ink">
              Last name
            </label>
            <Input
              id="last_name"
              name="last_name"
              type="text"
              required
              disabled={submitting}
              value={lastName}
              onChange={(e) => handleLastNameChange(e.target.value)}
              onBlur={() => handleBlur("lastName")}
              aria-invalid={Boolean(lastNameError)}
              className={`mt-1.5 ${lastNameError ? "border-coral-warn focus:border-coral-warn focus:ring-coral-warn/20" : ""}`}
              placeholder="Okafor"
            />
            <FieldError error={lastNameError} />
          </div>
        </div>

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
            onBlur={() => handleBlur("email")}
            aria-invalid={Boolean(emailError)}
            className={`mt-1.5 ${emailError ? "border-coral-warn focus:border-coral-warn focus:ring-coral-warn/20" : ""}`}
            placeholder="amina@company.com"
          />
          <FieldError error={emailError} />
        </div>

        {/* Phone Number Field */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-ink">
            Phone number <span className="font-normal text-mist">(Nigerian format)</span>
          </label>
          <Input
            id="phone_number"
            name="phone_number"
            type="tel"
            autoComplete="tel"
            required
            disabled={submitting}
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={() => handleBlur("phone")}
            aria-invalid={Boolean(phoneError)}
            className={`mt-1.5 ${phoneError ? "border-coral-warn focus:border-coral-warn focus:ring-coral-warn/20" : ""}`}
            placeholder="08012345678"
          />
          <FieldError error={phoneError} />
        </div>

        {/* Password Field */}
        <PasswordField
          id="password"
          autoComplete="new-password"
          label="Password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          onBlur={() => handleBlur("password")}
          error={passwordError}
          showStrength={true}
          strength={passwordResult.strength}
          disabled={submitting}
        />

        {/* Confirm Password Field */}
        <PasswordField
          id="password_confirm"
          name="password_confirm"
          autoComplete="new-password"
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          onBlur={() => handleBlur("confirmPassword")}
          error={confirmPasswordError}
          disabled={submitting}
        />

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
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-mist">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-sky hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
