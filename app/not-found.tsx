import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "404 — Page Not Found",
  description: "The requested page on Ryport could not be found.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E1A] px-4 text-center text-white">
      <h1 className="font-display text-6xl font-bold text-sky sm:text-8xl">404</h1>
      <h2 className="mt-4 font-display text-2xl sm:text-3xl">Page Not Found</h2>
      <p className="mt-2 max-w-md text-sm text-mist sm:text-base">
        The page you are looking for could not be found or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand/90"
      >
        Return to Homepage
      </Link>
    </div>
  );
}
