import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server bundle at .next/standalone —
  // this is what makes the Docker image small and fast to start.
  output: "standalone",
};

export default nextConfig;
