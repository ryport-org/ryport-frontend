import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Serif, Source_Sans_3 } from "next/font/google";
import { StaffAuthProvider } from "@/lib/staff/auth/auth-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo/site";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = createMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2545E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0E1A" },
  ],
  colorScheme: "light dark",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://capsykyrncpdtjudkxeb.supabase.co" />
        <link rel="dns-prefetch" href="https://ryport.onrender.com" />
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <JsonLd />
        <AuthProvider>
          <StaffAuthProvider>
            <PwaProvider>{children}</PwaProvider>
          </StaffAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
