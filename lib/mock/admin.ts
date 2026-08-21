import { mockEvents, mockUsersList } from "@/lib/mock/events";
import type {
  AdminEventListItem,
  AdminUserListItem,
  AnalyticsDataPoint,
  AnalyticsSummary,
  DashboardMetrics,
} from "@/lib/types";

export const mockDashboardMetrics: DashboardMetrics = {
  events_today: 1,
  events_this_week: 2,
  events_this_month: 4,
  events_total: mockEvents.length,
  users_today: 0,
  users_this_week: 1,
  users_total: mockUsersList.length,
};

export const mockAdminEvents: AdminEventListItem[] = mockEvents.map((event) => {
  const host = mockUsersList.find((user) => user.id === event.created_by)!;
  return {
    id: event.id,
    title: event.title,
    host_name: host.name,
    event_date: event.event_date,
    participant_count: event.participant_count,
    status: event.status,
    created_at: event.created_at,
  };
});

export const mockAdminUsers: AdminUserListItem[] = mockUsersList.map(
  (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    role: user.role,
    created_at: user.created_at,
    events_created_count: mockEvents.filter(
      (event) => event.created_by === user.id,
    ).length,
    events_joined_count: mockEvents.filter((event) =>
      event.participants.some((participant) => participant.user_id === user.id),
    ).length,
  }),
);

const last7DaysDataPoints: AnalyticsDataPoint[] = [
  { date: "2026-08-15", event_count: 1, user_count: 0 },
  { date: "2026-08-16", event_count: 0, user_count: 1 },
  { date: "2026-08-17", event_count: 2, user_count: 0 },
  { date: "2026-08-18", event_count: 0, user_count: 0 },
  { date: "2026-08-19", event_count: 1, user_count: 1 },
  { date: "2026-08-20", event_count: 0, user_count: 0 },
  { date: "2026-08-21", event_count: 1, user_count: 0 },
];

export const mockAnalyticsSummary: AnalyticsSummary = {
  total_events: mockEvents.length,
  total_users: mockUsersList.length,
  average_participants_per_event: Math.round(
    mockEvents.reduce((sum, event) => sum + event.participant_count, 0) /
      mockEvents.length,
  ),
  data_points: last7DaysDataPoints,
};
