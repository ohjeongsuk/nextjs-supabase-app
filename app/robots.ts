import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/auth",
        "/protected",
        "/profile",
        "/events/new",
        "/events/*/edit",
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
