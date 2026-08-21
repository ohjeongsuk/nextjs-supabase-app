import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hncdzcfrywkqydslkmkm.supabase.co",
        pathname: "/storage/v1/object/public/event-covers/**",
      },
    ],
  },
};

export default nextConfig;
