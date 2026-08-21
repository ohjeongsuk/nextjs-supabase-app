import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { EventHostActions } from "@/components/event-host-actions";
import { InviteShareButton } from "@/components/invite-share-button";
import { ParticipantsSection } from "@/components/participants-section";
import { getEventById } from "@/lib/queries/events";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  const event = await getEventById(id).catch(() => null);

  if (!event) {
    notFound();
  }

  const isHost = event.created_by === userId;
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

        <ParticipantsSection
          eventId={event.id}
          initialParticipants={event.participants}
        />

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
