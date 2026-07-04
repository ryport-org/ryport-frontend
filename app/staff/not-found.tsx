import Link from "next/link";
import { staffPath } from "@/lib/staff/routes";

export default function StaffNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="text-6xl font-semibold text-ink">404</p>
      <h1 className="mt-4 text-xl font-semibold text-ink">Staff page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This staff dashboard route does not exist. Check the URL or return to the dashboard.
      </p>
      <Link
        href={staffPath()}
        className="mt-6 inline-flex min-h-9 items-center rounded-md bg-accent px-4 text-sm font-medium text-white hover:brightness-110"
      >
        Back to staff dashboard
      </Link>
    </div>
  );
}
