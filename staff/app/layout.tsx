import type { Metadata } from "next";
import { StaffAuthProvider } from "@/lib/auth/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ryport Staff",
    template: "%s · Ryport Staff",
  },
  description: "Internal operations dashboard for Ryport staff.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StaffAuthProvider>{children}</StaffAuthProvider>
      </body>
    </html>
  );
}
