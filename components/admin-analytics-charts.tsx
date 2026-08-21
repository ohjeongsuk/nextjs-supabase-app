"use client";

import { useState, useTransition } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAnalyticsSummary } from "@/lib/actions/admin";
import type { AnalyticsPeriod, AnalyticsSummary } from "@/lib/types";

const periodOptions: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "90d", label: "최근 90일" },
];

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { value: number; name: string }[];
  unit: string;
}

function ChartTooltip({ active, label, payload, unit }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">
        {label && new Date(label).toLocaleDateString("ko-KR")}
      </p>
      <p className="font-medium text-popover-foreground">
        {payload[0].value}
        {unit}
      </p>
    </div>
  );
}

interface AdminAnalyticsChartsProps {
  initialSummary: AnalyticsSummary;
}

export function AdminAnalyticsCharts({
  initialSummary,
}: AdminAnalyticsChartsProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const [summary, setSummary] = useState(initialSummary);
  const [isPending, startTransition] = useTransition();

  function handlePeriodChange(value: AnalyticsPeriod) {
    setPeriod(value);
    startTransition(async () => {
      const result = await fetchAnalyticsSummary(value);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setSummary(result.data);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4">
          <SummaryStat label="총 이벤트 수" value={summary.total_events} />
          <SummaryStat label="총 사용자 수" value={summary.total_users} />
          <SummaryStat
            label="평균 참여자 수"
            value={summary.average_participants_per_event}
          />
        </div>

        <Select
          value={period}
          onValueChange={(value) =>
            handlePeriodChange(value as AnalyticsPeriod)
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">이벤트 생성 추이</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.data_points}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString("ko-KR", {
                    month: "numeric",
                    day: "numeric",
                  })
                }
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                allowDecimals={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<ChartTooltip unit="개" />} />
              <Line
                type="monotone"
                dataKey="event_count"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용자 증가 추이</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.data_points}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString("ko-KR", {
                    month: "numeric",
                    day: "numeric",
                  })
                }
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                allowDecimals={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<ChartTooltip unit="명" />} />
              <Line
                type="monotone"
                dataKey="user_count"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
