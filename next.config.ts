import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://images.unsplash.com/**"),
      new URL("https://api.qrserver.com/**"),
    ],
    qualities: [25, 50, 75, 100],
  },
};

export default nextConfig;
