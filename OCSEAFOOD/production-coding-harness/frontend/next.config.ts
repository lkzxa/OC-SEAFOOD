import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // BACKEND_URL: server-side env var (set in Vercel Dashboard or .env.local)
    // Falls back to localhost:5000 for local development
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
