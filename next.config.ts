import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/api/**/*": ["./lib/generated/prisma/**/*"],
    "/api/**/**/**": ["./lib/generated/prisma/**/*"],
    "/*": ["./lib/generated/prisma/**/*"],
  },
};

export default nextConfig;
