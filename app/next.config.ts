import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    appDir: true,
    nodeMiddleware: true,
  },
};

export default nextConfig;
