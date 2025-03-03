import type { NextConfig } from "next";
const path = require("path");

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        "http://localhost:3000",
        "https://funding-manager.vercel.app",
      ],
    },
    turbo: {
      resolveAlias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
  },

  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "./");
    return config;
  },
};

export default nextConfig;
