// Server Action / Route Handler 응답 타입
// 실제 구현은 Task 009~011에서 진행되며, 컴포넌트가 미리 이 타입에 맞춰 UI를 작성할 수 있도록 선언

import type {
  Event,
  EventStatus,
  EventWithHost,
  EventWithParticipants,
  ParticipantWithUser,
  UserRole,
} from "./domain";

export type ActionResult<T> =
  { success: true; data: T } | { success: false; error: string };

export interface EventListResponse {
  events: EventWithParticipants[];
}

export interface EventDetailResponse {
  event: EventWithHost;
  participants: ParticipantWithUser[];
}

export interface JoinEventResponse {
  event: Event;
  already_joined: boolean;
}

// 관리자 대시보드 (F012)
export interface DashboardMetrics {
  events_today: number;
  events_this_week: number;
  events_this_month: number;
  events_total: number;
  users_today: number;
  users_this_week: number;
  users_total: number;
}

// 관리자 이벤트 관리 테이블 (F013)
export interface AdminEventListItem {
  id: string;
  title: string;
  host_name: string;
  event_date: string;
  participant_count: number;
  status: EventStatus;
  created_at: string;
}

// 관리자 사용자 관리 테이블 (F014)
export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  events_created_count: number;
  events_joined_count: number;
}

// 관리자 통계 분석 (F015)
export type AnalyticsPeriod = "7d" | "30d" | "90d";

export interface AnalyticsDataPoint {
  date: string;
  event_count: number;
  user_count: number;
}

export interface AnalyticsSummary {
  total_events: number;
  total_users: number;
  average_participants_per_event: number;
  data_points: AnalyticsDataPoint[];
}
