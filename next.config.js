/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👉 tell Next.js to skip ESLint entirely during `next build`
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // if you’re using App Router + middleware
    appDir: true,
    nodeMiddleware: true,
  },
};

module.exports = nextConfig;
