import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack root to this workspace so Next does not pick up unrelated
  // lockfiles in parent directories.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
