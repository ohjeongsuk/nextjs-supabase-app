import { deriveEventStatus } from "@/lib/event-status";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminEventListItem,
  AdminUserListItem,
  AnalyticsDataPoint,
  AnalyticsPeriod,
  AnalyticsSummary,
  DashboardMetrics,
} from "@/lib/types";

const PERIOD_DAYS: Record<AnalyticsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setMonth(monthStart.getMonth() - 1);

  const [
    eventsToday,
    eventsThisWeek,
    eventsThisMonth,
    eventsTotal,
    usersToday,
    usersThisWeek,
    usersTotal,
  ] = await Promise.all([
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekStart.toISOString()),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString()),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekStart.toISOString()),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return {
    events_today: eventsToday.count ?? 0,
    events_this_week: eventsThisWeek.count ?? 0,
    events_this_month: eventsThisMonth.count ?? 0,
    events_total: eventsTotal.count ?? 0,
    users_today: usersToday.count ?? 0,
    users_this_week: usersThisWeek.count ?? 0,
    users_total: usersTotal.count ?? 0,
  };
}

export async function getAdminEvents(): Promise<AdminEventListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, event_date, created_at, host:profiles!events_created_by_fkey(name), event_participants(id)",
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((event) => ({
    id: event.id,
    title: event.title,
    host_name:
      (event.host as { name: string | null } | null)?.name ?? "이름 없음",
    event_date: event.event_date,
    participant_count: event.event_participants.length,
    status: deriveEventStatus(event.event_date),
    created_at: event.created_at,
  }));
}

export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: profiles, error }, { data: authUsers }] = await Promise.all([
    supabase.from("profiles").select("id, name, avatar_url, role, created_at"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (error || !profiles) return [];

  const emailById = new Map(
    (authUsers?.users ?? []).map((user) => [user.id, user.email ?? ""]),
  );

  const { data: events } = await supabase
    .from("events")
    .select("created_by, event_participants(user_id)");

  const createdCountById = new Map<string, number>();
  const joinedCountById = new Map<string, number>();
  for (const event of events ?? []) {
    createdCountById.set(
      event.created_by,
      (createdCountById.get(event.created_by) ?? 0) + 1,
    );
    for (const participant of event.event_participants) {
      joinedCountById.set(
        participant.user_id,
        (joinedCountById.get(participant.user_id) ?? 0) + 1,
      );
    }
  }

  return profiles.map((profile) => ({
    id: profile.id,
    name: profile.name ?? "이름 없음",
    email: emailById.get(profile.id) ?? "",
    avatar_url: profile.avatar_url,
    role: profile.role === "admin" ? "admin" : "user",
    created_at: profile.created_at,
    events_created_count: createdCountById.get(profile.id) ?? 0,
    events_joined_count: joinedCountById.get(profile.id) ?? 0,
  }));
}

export async function getAnalyticsSummary(
  period: AnalyticsPeriod = "7d",
): Promise<AnalyticsSummary> {
  const supabase = await createClient();
  const days = PERIOD_DAYS[period];
  const rangeStart = startOfDay(new Date());
  rangeStart.setDate(rangeStart.getDate() - (days - 1));

  const [
    { count: totalEvents },
    { count: totalUsers },
    { data: eventsInRange },
    { data: participantCounts },
    { data: profilesInRange },
  ] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("created_at")
      .gte("created_at", rangeStart.toISOString()),
    supabase.from("events").select("event_participants(id)"),
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", rangeStart.toISOString()),
  ]);

  const totalParticipants = (participantCounts ?? []).reduce(
    (sum, event) => sum + event.event_participants.length,
    0,
  );
  const averageParticipants =
    totalEvents && totalEvents > 0
      ? Math.round(totalParticipants / totalEvents)
      : 0;

  const dataPoints: AnalyticsDataPoint[] = [];
  const eventCountByDay = new Map<string, number>();
  const userCountByDay = new Map<string, number>();

  for (const event of eventsInRange ?? []) {
    const key = toDateKey(new Date(event.created_at));
    eventCountByDay.set(key, (eventCountByDay.get(key) ?? 0) + 1);
  }
  for (const profile of profilesInRange ?? []) {
    const key = toDateKey(new Date(profile.created_at));
    userCountByDay.set(key, (userCountByDay.get(key) ?? 0) + 1);
  }

  for (let i = 0; i < days; i++) {
    const date = new Date(rangeStart);
    date.setDate(date.getDate() + i);
    const key = toDateKey(date);
    dataPoints.push({
      date: key,
      event_count: eventCountByDay.get(key) ?? 0,
      user_count: userCountByDay.get(key) ?? 0,
    });
  }

  return {
    total_events: totalEvents ?? 0,
    total_users: totalUsers ?? 0,
    average_participants_per_event: averageParticipants,
    data_points: dataPoints,
  };
}
