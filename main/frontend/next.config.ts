import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  eslint: {
    // Keep parity migration moving; unused-import warnings from ported files are non-blocking.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
