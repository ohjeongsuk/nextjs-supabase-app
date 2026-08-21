import { Suspense } from "react";
import { AdminAnalyticsCharts } from "@/components/admin-analytics-charts";
import { getAnalyticsSummary } from "@/lib/queries/admin";

async function AdminAnalyticsContent() {
  const summary = await getAnalyticsSummary("7d");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">통계 분석</h1>
      <AdminAnalyticsCharts initialSummary={summary} />
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <Suspense>
      <AdminAnalyticsContent />
    </Suspense>
  );
}
