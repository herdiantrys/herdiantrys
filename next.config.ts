import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // reactCompiler: true,
  experimental: {
    // @ts-expect-error - React Compiler is experimental
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },

};

export default nextConfig;
