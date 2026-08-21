import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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

// SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN이 없으면 소스맵 업로드를 건너뛰고 빌드만 진행함
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
