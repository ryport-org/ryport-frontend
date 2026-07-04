import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Serif, Source_Sans_3 } from "next/font/google";
// OAuth temporarily disabled — re-enable: import { OAuthHandler } from "@/components/auth/oauth-handler";
import { StaffAuthProvider } from "@/lib/staff/auth/auth-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { createMetadata } from "@/lib/seo/site";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...createMetadata(),
  icons: {
    icon: "/icon.jpeg",
    apple: "/apple-icon.jpeg",
  },
  category: "finance",
  applicationName: "Ryport",
  authors: [{ name: "Ryport", url: "https://www.ryport.com.ng" }],
  creator: "Ryport",
  publisher: "Ryport",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFBFC" },
    { media: "(prefers-color-scheme: dark)", color: "#13171F" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-NG"
      className={`${sourceSans.variable} ${instrumentSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <AuthProvider>
          <StaffAuthProvider>
            {/* <OAuthHandler /> */}
            {children}
          </StaffAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
