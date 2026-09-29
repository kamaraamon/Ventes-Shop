import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vpct/ui", "@vpct/config", "@vpct/db", "@vpct/payments", "@vpct/auth", "@vpct/tokens"],
};

export default nextConfig;
