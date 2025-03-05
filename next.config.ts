import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
