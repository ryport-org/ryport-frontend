"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldError } from "@/components/auth/field-error";
import type { PasswordStrength } from "@/lib/validation/auth";

type PasswordFieldProps = {
  id: string;
  name?: string;
  autoComplete?: string;
  placeholder?: string;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string | null;
  showStrength?: boolean;
  strength?: PasswordStrength;
  disabled?: boolean;
};

export function PasswordField({
  id,
  name = "password",
  autoComplete = "current-password",
  placeholder = "••••••••",
  label = "Password",
  value,
  onChange,
  onBlur,
  error,
  showStrength = false,
  strength = "weak",
  disabled = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  const strengthColors: Record<PasswordStrength, { bg: string; text: string; label: string }> = {
    weak: { bg: "bg-coral-warn", text: "text-coral-warn", label: "Weak" },
    medium: { bg: "bg-amber-500", text: "text-amber-600", label: "Medium" },
    strong: { bg: "bg-emerald-500", text: "text-emerald-600", label: "Strong" },
  };

  const currentStrength = strengthColors[strength];

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
        {showStrength && value && value.length > 0 && (
          <span className={`text-xs font-semibold ${currentStrength.text}`}>
            {currentStrength.label}
          </span>
        )}
      </div>

      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`block w-full rounded-lg border bg-white py-2.5 pr-11 pl-4 text-sm text-ink outline-none transition-colors placeholder:text-mist focus:ring-2 disabled:bg-paper disabled:opacity-70 ${
            error
              ? "border-coral-warn focus:border-coral-warn focus:ring-coral-warn/20"
              : "border-line focus:border-sky focus:ring-sky/20"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-mist transition-colors hover:text-ink focus:outline-none disabled:opacity-50"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {showStrength && value && value.length > 0 && (
        <div className="mt-2 flex h-1.5 w-full gap-1.5 overflow-hidden rounded-full bg-line/60">
          <div
            className={`h-full transition-all duration-300 ${
              strength === "weak"
                ? "w-1/3 bg-coral-warn"
                : strength === "medium"
                ? "w-2/3 bg-amber-500"
                : "w-full bg-emerald-500"
            }`}
          />
        </div>
      )}

      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}
