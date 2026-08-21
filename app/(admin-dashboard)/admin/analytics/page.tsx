import { Suspense } from "react";
import { AdminAnalyticsChartsLoader } from "@/components/admin-analytics-charts-loader";
import { getAnalyticsSummary } from "@/lib/queries/admin";

async function AdminAnalyticsContent() {
  const summary = await getAnalyticsSummary("7d");

  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-2xl font-bold">통계 분석</h1>
      <AdminAnalyticsChartsLoader initialSummary={summary} />
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
