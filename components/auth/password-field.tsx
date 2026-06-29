"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  id: string;
  name?: string;
  autoComplete?: string;
  placeholder?: string;
  label?: string;
};

export function PasswordField({
  id,
  name = "password",
  autoComplete = "current-password",
  placeholder = "••••••••",
  label = "Password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          placeholder={placeholder}
          className="block w-full rounded-lg border border-line bg-white py-2.5 pr-11 pl-4 text-sm text-ink outline-none transition-colors focus:border-sky focus:ring-2 focus:ring-sky/20"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-mist transition-colors hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
