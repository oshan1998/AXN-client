import type { NextConfig } from "next";

const AXN_API_URL = process.env.AXN_API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  // The NestJS backend has no CORS config; proxying keeps browser calls same-origin.
  async rewrites() {
    return [
      {
        source: "/api/axn/:path*",
        destination: `${AXN_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
