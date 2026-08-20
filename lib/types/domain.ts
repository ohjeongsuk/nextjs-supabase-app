// PRD 데이터 모델(users, events, event_participants) 기반 임시 도메인 타입
// Task 007에서 Supabase 스키마 확정 시 lib/supabase/types.ts의 Tables<> 기반 타입으로 교체 예정
// 필드명은 최종 DB 컬럼명(snake_case)과 동일하게 유지해 교체 비용을 최소화한다

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type EventStatus = "upcoming" | "ongoing" | "ended";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  event_date: string;
  cover_image_url: string | null;
  invite_code: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type ParticipantRole = "host" | "participant";

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  role: ParticipantRole;
  joined_at: string;
}

export interface EventWithParticipants extends Event {
  participants: EventParticipant[];
  participant_count: number;
}

export interface ParticipantWithUser extends EventParticipant {
  user: User;
}

export interface EventWithHost extends Event {
  host: User;
}
