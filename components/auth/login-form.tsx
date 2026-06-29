import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { SocialLogins } from "@/components/auth/social-logins";

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-sky focus:ring-2 focus:ring-sky/20";

export function LoginForm() {
  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-2 text-sm text-mist">
        Enter your email and password to access your account.
      </p>

      <form className="mt-8 space-y-5" action="#" method="post">
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

        <PasswordField id="password" />

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-mist">
            <input
              type="checkbox"
              name="remember"
              className="size-4 rounded border-line text-sky focus:ring-sky/20"
            />
            Remember me
          </label>
          <Link href="#" className="text-sm font-medium text-sky hover:underline">
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Log in
        </Button>
      </form>

      <SocialLogins />

      <p className="mt-6 text-center text-sm text-mist">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-sky hover:underline">
          Register now
        </Link>
      </p>
    </div>
  );
}
