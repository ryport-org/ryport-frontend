import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  // Prevent double-mounting and duplicate network API calls in development
  reactStrictMode: false,

  // Keep built pages in memory for 5 minutes instead of discarding them after 25s
  onDemandEntries: {
    maxInactiveAge: 300 * 1000,
    pagesBufferLength: 20,
  },

  // Enable client-side router caching so navigated pages respond instantly
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/staff/staff",
        destination: "/staff/team",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
