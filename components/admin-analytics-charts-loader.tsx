"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsSummary } from "@/lib/types";

const AdminAnalyticsCharts = dynamic(
  () =>
    import("@/components/admin-analytics-charts").then(
      (mod) => mod.AdminAnalyticsCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

interface AdminAnalyticsChartsLoaderProps {
  initialSummary: AnalyticsSummary;
}

export function AdminAnalyticsChartsLoader({
  initialSummary,
}: AdminAnalyticsChartsLoaderProps) {
  return <AdminAnalyticsCharts initialSummary={initialSummary} />;
}
