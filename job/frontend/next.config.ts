import type { NextConfig } from "next";

// /api/* is forwarded to the backend by app/api/[...path]/route.ts (reads BACKEND_INTERNAL_URL at runtime).
const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
