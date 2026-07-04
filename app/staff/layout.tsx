import { StaffAuthProvider } from "@/lib/staff/auth/auth-context";

export const metadata = {
  title: "Staff",
  robots: { index: false, follow: false },
};

export default function StaffRootLayout({ children }: { children: React.ReactNode }) {
  return <StaffAuthProvider>{children}</StaffAuthProvider>;
}
