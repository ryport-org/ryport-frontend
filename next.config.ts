import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
