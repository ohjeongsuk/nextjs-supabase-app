import { BarChart3, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDashboardMetrics } from "@/lib/mock/admin";

const metricCards = [
  { key: "events_today", label: "오늘 생성된 이벤트" },
  { key: "events_this_week", label: "이번 주 생성된 이벤트" },
  { key: "events_this_month", label: "이번 달 생성된 이벤트" },
  { key: "events_total", label: "전체 이벤트 수" },
  { key: "users_today", label: "오늘 가입한 사용자" },
  { key: "users_this_week", label: "이번 주 가입한 사용자" },
  { key: "users_total", label: "전체 사용자 수" },
] as const;

const quickLinks = [
  { href: "/admin/events", icon: Calendar, label: "이벤트 관리" },
  { href: "/admin/users", icon: Users, label: "사용자 관리" },
  { href: "/admin/analytics", icon: BarChart3, label: "통계 분석" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">대시보드</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {mockDashboardMetrics[card.key]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-foreground">빠른 링크</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <link.icon className="size-5 text-primary" />
                  <span className="font-medium text-card-foreground">
                    {link.label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
