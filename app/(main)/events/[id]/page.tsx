import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { EventHostActions } from "@/components/event-host-actions";
import { InviteShareButton } from "@/components/invite-share-button";
import { ParticipantCard } from "@/components/participant-card";
import { currentMockUser, getMockEventById } from "@/lib/mock/events";
import type { EventStatus } from "@/lib/types";

const statusLabels: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

type Props = {
  params: Promise<{ id: string }>;
};

async function EventDetailContent({ params }: Props) {
  const { id } = await params;
  const event = getMockEventById(id);

  if (!event) {
    notFound();
  }

  const isHost = event.created_by === currentMockUser.id;
  const eventDate = new Date(event.event_date);

  return (
    <div className="pb-6">
      <div className="relative aspect-video w-full bg-muted">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <CalendarDays className="size-10" />
          </div>
        )}
        <Badge className="absolute right-3 top-3">
          {statusLabels[event.status]}
        </Badge>
      </div>

      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span>
              {eventDate.toLocaleString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span>{event.location}</span>
          </div>
          {event.description && (
            <p className="whitespace-pre-wrap pt-2 text-sm text-foreground">
              {event.description}
            </p>
          )}
        </div>

        {isHost && <InviteShareButton inviteCode={event.invite_code} />}

        <div>
          <h2 className="mb-2 font-semibold text-foreground">
            참여자 {event.participant_count}명
          </h2>
          <div>
            {event.participants.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        </div>

        {isHost && <EventHostActions eventId={event.id} />}
      </div>
    </div>
  );
}

export default function EventDetailPage({ params }: Props) {
  return (
    <Suspense>
      <EventDetailContent params={params} />
    </Suspense>
  );
}
