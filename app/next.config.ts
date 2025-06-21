import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    nodeMiddleware: true, // Added this line/object
  },
};

export default nextConfig;
