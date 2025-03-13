import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "http://localhost:3000",
        "https://funding-manager.vercel.app",
      ],
    },
  },
};

export default nextConfig;
