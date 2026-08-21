import { deriveEventStatus } from "@/lib/event-status";
import { createClient } from "@/lib/supabase/server";
import type {
  EventWithHost,
  EventWithParticipants,
  ParticipantWithUser,
  User,
} from "@/lib/types";

type ProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

// event_participants.user는 이벤트 상세 화면(참여자 카드)에서만 쓰이며 이메일을 표시하지 않으므로 빈 값으로 채운다
function toParticipantUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    email: "",
    name: profile.name,
    avatar_url: profile.avatar_url,
    role: profile.role === "admin" ? "admin" : "user",
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

export async function getHostedEvents(
  userId: string,
): Promise<EventWithParticipants[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_participants(*, profiles(*))")
    .eq("created_by", userId)
    .order("event_date", { ascending: true });

  if (error || !data) return [];

  return data.map((event) => toEventWithParticipants(event));
}

export async function getJoinedEvents(
  userId: string,
): Promise<EventWithParticipants[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_participants!inner(*, profiles(*))")
    .neq("created_by", userId)
    .eq("event_participants.user_id", userId)
    .order("event_date", { ascending: true });

  if (error || !data) return [];

  // 위 필터는 "참여자 목록에 본인이 있는 이벤트"만 골라내고,
  // 아래에서는 그 이벤트의 전체 참여자 목록을 다시 조회해 카드에 표시한다
  const eventIds = data.map((event) => event.id);
  if (eventIds.length === 0) return [];

  const { data: fullEvents } = await supabase
    .from("events")
    .select("*, event_participants(*, profiles(*))")
    .in("id", eventIds)
    .order("event_date", { ascending: true });

  return (fullEvents ?? []).map((event) => toEventWithParticipants(event));
}

type EventDetail = EventWithHost & {
  participants: ParticipantWithUser[];
  participant_count: number;
};

async function getEventByColumn(
  column: "id" | "invite_code",
  value: string,
): Promise<EventDetail> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "*, event_participants(*, profiles(*)), host:profiles!events_created_by_fkey(*)",
    )
    .eq(column, value)
    .single();

  if (error || !data) {
    throw new Error("이벤트를 찾을 수 없어요");
  }

  const participants = (data.event_participants ?? []).map((participant) => ({
    id: participant.id,
    event_id: participant.event_id,
    user_id: participant.user_id,
    role:
      participant.role === "host"
        ? ("host" as const)
        : ("participant" as const),
    joined_at: participant.joined_at,
    user: toParticipantUser(participant.profiles as ProfileRow),
  }));

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    location: data.location,
    event_date: data.event_date,
    cover_image_url: data.cover_image_url,
    invite_code: data.invite_code,
    status: deriveEventStatus(data.event_date),
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    host: toParticipantUser(data.host as ProfileRow),
    participants,
    participant_count: participants.length,
  };
}

export function getEventById(eventId: string): Promise<EventDetail> {
  return getEventByColumn("id", eventId);
}

export function getEventByInviteCode(inviteCode: string): Promise<EventDetail> {
  return getEventByColumn("invite_code", inviteCode);
}

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  event_date: string;
  cover_image_url: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  event_participants: {
    id: string;
    event_id: string;
    user_id: string;
    role: string;
    joined_at: string;
    profiles: ProfileRow | null;
  }[];
};

function toEventWithParticipants(event: EventRow): EventWithParticipants {
  const participants = event.event_participants
    .filter((participant) => participant.profiles !== null)
    .map((participant) => ({
      id: participant.id,
      event_id: participant.event_id,
      user_id: participant.user_id,
      role:
        participant.role === "host"
          ? ("host" as const)
          : ("participant" as const),
      joined_at: participant.joined_at,
      user: toParticipantUser(participant.profiles as ProfileRow),
    }));

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    event_date: event.event_date,
    cover_image_url: event.cover_image_url,
    invite_code: event.invite_code,
    status: deriveEventStatus(event.event_date),
    created_by: event.created_by,
    created_at: event.created_at,
    updated_at: event.updated_at,
    participants,
    participant_count: participants.length,
  };
}
