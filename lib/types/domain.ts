// Task 007에서 확정된 Supabase 스키마(lib/supabase/types.ts) 기반 도메인 타입
// status/role처럼 CHECK 제약으로 정의된 컬럼은 생성된 타입에서 string으로만 나오므로 여기서 리터럴 유니언으로 좁힌다

import type { Tables } from "@/lib/supabase/types";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type EventStatus = "upcoming" | "ongoing" | "ended";

export interface Event extends Omit<Tables<"events">, "status"> {
  status: EventStatus;
}

export type ParticipantRole = "host" | "participant";

export interface EventParticipant extends Omit<
  Tables<"event_participants">,
  "role"
> {
  role: ParticipantRole;
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
