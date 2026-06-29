import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { SocialLogins } from "@/components/auth/social-logins";

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-sky focus:ring-2 focus:ring-sky/20";

export function RegisterForm() {
  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-mist">
        Start free — track revenue, monitor cash flow, and get AI guidance in minutes.
      </p>

      <form className="mt-8 space-y-5" action="#" method="post">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
            placeholder="Ada Nwosu"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>

        <PasswordField
          id="password"
          autoComplete="new-password"
          label="Password"
        />

        <Button type="submit" variant="primary" className="w-full">
          Create account
        </Button>
      </form>

      <SocialLogins />

      <p className="mt-6 text-center text-sm text-mist">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-sky hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
