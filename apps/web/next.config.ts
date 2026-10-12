import type { NextConfig } from "next";
import { getApiOrigin } from "./src/lib/api-origin";

const nextConfig: NextConfig = {
  output: process.env.NEXT_BUILD_TARGET === "standalone" ? "standalone" : undefined,
  devIndicators: false,
  experimental: { proxyClientMaxBodySize: "20mb" },
  async rewrites() {
    const origin = getApiOrigin();
    return [
      { source: "/api/:path*", destination: `${origin}/api/:path*` },
    ];
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
