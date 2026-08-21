import { CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { EventHostActions } from "@/components/event-host-actions";
import { InviteShareButton } from "@/components/invite-share-button";
import { ParticipantListSkeleton } from "@/components/loading-skeletons";
import { ParticipantsSection } from "@/components/participants-section";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventById } from "@/lib/queries/events";
import { createClient } from "@/lib/supabase/server";
import type { EventStatus } from "@/lib/types";

const statusLabels: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

function EventDetailSkeleton() {
  return (
    <div className="pb-6">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-11 w-full" />
        <div>
          <Skeleton className="mb-2 h-5 w-24" />
          <ParticipantListSkeleton />
        </div>
      </div>
    </div>
  );
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id).catch(() => null);

  if (!event) {
    return { title: "이벤트를 찾을 수 없어요" };
  }

  return {
    title: `${event.title} | Gather`,
    description: `${event.location}에서 열리는 이벤트예요`,
  };
}

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
      <div className="bg-muted relative aspect-video w-full">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <CalendarDays className="size-10" />
          </div>
        )}
        <Badge className="absolute top-3 right-3">
          {statusLabels[event.status]}
        </Badge>
      </div>

      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <h1 className="text-foreground text-2xl font-bold">{event.title}</h1>
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
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
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <MapPin className="size-4 shrink-0" />
            <span>{event.location}</span>
          </div>
          {event.description && (
            <p className="text-foreground pt-2 text-sm whitespace-pre-wrap">
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
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetailContent params={params} />
    </Suspense>
  );
}
