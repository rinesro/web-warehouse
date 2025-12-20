import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.1.6:3000"], 
    },
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: {
    "/api/**/*": ["./lib/generated/prisma/*"],
    "/*": ["./lib/generated/prisma/*"],
  },
};

export default nextConfig;
