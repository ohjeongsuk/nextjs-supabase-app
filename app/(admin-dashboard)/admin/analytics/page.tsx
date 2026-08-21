import { AdminAnalyticsCharts } from "@/components/admin-analytics-charts";
import { mockAnalyticsSummary } from "@/lib/mock/admin";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">통계 분석</h1>
      <AdminAnalyticsCharts summary={mockAnalyticsSummary} />
    </div>
  );
}
