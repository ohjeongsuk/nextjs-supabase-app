import type {
  EventStatus,
  EventWithHost,
  EventWithParticipants,
  ParticipantWithUser,
  User,
} from "@/lib/types";

export const mockUsersList: User[] = [
  {
    id: "user-1",
    email: "hayoon.jung@example.com",
    name: "정하윤",
    avatar_url: null,
    role: "user",
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "user-2",
    email: "doyoon.kang@example.com",
    name: "강도윤",
    avatar_url: null,
    role: "user",
    created_at: "2026-07-02T00:00:00.000Z",
    updated_at: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "user-3",
    email: "seoyeon.im@example.com",
    name: "임서연",
    avatar_url: null,
    role: "user",
    created_at: "2026-07-03T00:00:00.000Z",
    updated_at: "2026-07-03T00:00:00.000Z",
  },
  {
    id: "user-4",
    email: "admin@example.com",
    name: "관리자",
    avatar_url: null,
    role: "admin",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];

const mockUsers = mockUsersList.filter((user) => user.role === "user");

export const currentMockUser = mockUsers[0];

function createParticipants(
  eventId: string,
  count: number,
  createdBy: string,
): ParticipantWithUser[] {
  return Array.from({ length: count }, (_, index) => {
    const user = mockUsers[index % mockUsers.length];
    return {
      id: `${eventId}-participant-${index}`,
      event_id: eventId,
      user_id: user.id,
      role: user.id === createdBy ? "host" : "participant",
      joined_at: "2026-08-01T00:00:00.000Z",
      user,
    };
  });
}

interface MockEventInput {
  id: string;
  title: string;
  description: string | null;
  location: string;
  event_date: string;
  status: EventStatus;
  participantCount: number;
  createdBy: string;
}

const mockEventInputs: MockEventInput[] = [
  {
    id: "event-1",
    title: "가을 등산 모임",
    description: "북한산 정상까지 함께 올라가요. 초보자도 환영합니다.",
    location: "북한산 국립공원",
    event_date: "2026-09-15T09:00:00.000Z",
    status: "upcoming",
    participantCount: 8,
    createdBy: mockUsers[0].id,
  },
  {
    id: "event-2",
    title: "동네 보드게임 카페 모임",
    description: null,
    location: "홍대 보드게임 카페",
    event_date: "2026-08-20T13:00:00.000Z",
    status: "ongoing",
    participantCount: 5,
    createdBy: mockUsers[0].id,
  },
  {
    id: "event-3",
    title: "여름 워크숍 뒷풀이",
    description: "한 학기 고생한 우리, 맛있는 거 먹으러 가요.",
    location: "강남역 맛집",
    event_date: "2026-07-30T18:00:00.000Z",
    status: "ended",
    participantCount: 12,
    createdBy: mockUsers[1].id,
  },
  {
    id: "event-4",
    title: "겨울 스키캠프",
    description: null,
    location: "용평 리조트",
    event_date: "2026-12-05T08:00:00.000Z",
    status: "upcoming",
    participantCount: 4,
    createdBy: mockUsers[0].id,
  },
];

export const mockEvents: EventWithParticipants[] = mockEventInputs.map(
  (input) => {
    const participants = createParticipants(
      input.id,
      input.participantCount,
      input.createdBy,
    );
    return {
      id: input.id,
      title: input.title,
      description: input.description,
      location: input.location,
      event_date: input.event_date,
      cover_image_url: null,
      invite_code: input.id,
      status: input.status,
      created_by: input.createdBy,
      created_at: "2026-07-01T00:00:00.000Z",
      updated_at: "2026-07-01T00:00:00.000Z",
      participants,
      participant_count: participants.length,
    };
  },
);

// 내가 주최자(created_by)인 이벤트만 반환 (F007 주최자 뷰)
export function getMockHostedEvents(userId: string): EventWithParticipants[] {
  return mockEvents.filter((event) => event.created_by === userId);
}

// 내가 참여자로 등록된 이벤트만 반환, 주최한 이벤트는 제외 (F007 참여자 뷰)
export function getMockJoinedEvents(userId: string): EventWithParticipants[] {
  return mockEvents.filter(
    (event) =>
      event.created_by !== userId &&
      event.participants.some((participant) => participant.user_id === userId),
  );
}

interface MockEventDetail extends EventWithHost {
  participants: ParticipantWithUser[];
  participant_count: number;
}

export function getMockEventById(id: string): MockEventDetail | undefined {
  const input = mockEventInputs.find((event) => event.id === id);
  if (!input) return undefined;

  const participants = createParticipants(
    input.id,
    input.participantCount,
    input.createdBy,
  );
  const host = mockUsers.find((user) => user.id === input.createdBy)!;

  return {
    id: input.id,
    title: input.title,
    description: input.description,
    location: input.location,
    event_date: input.event_date,
    cover_image_url: null,
    invite_code: input.id,
    status: input.status,
    created_by: input.createdBy,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    host,
    participants,
    participant_count: participants.length,
  };
}

export const mockParticipants: ParticipantWithUser[] = createParticipants(
  mockEventInputs[0].id,
  mockEventInputs[0].participantCount,
  mockEventInputs[0].createdBy,
);
