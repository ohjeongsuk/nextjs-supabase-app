"use client";

import { CalendarDays, MapPin, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { joinEvent } from "@/lib/actions/participants";
import { createClient } from "@/lib/supabase/client";
import type { EventStatus, EventWithHost } from "@/lib/types";

const statusLabels: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

interface JoinEventCardProps {
  event: EventWithHost & { participant_count: number };
}

export function JoinEventCard({ event }: JoinEventCardProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const eventDate = new Date(event.event_date);

  async function handleJoin() {
    setIsJoining(true);
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/join/${event.invite_code}`,
        },
      });
      return;
    }

    const result = await joinEvent(event.invite_code);
    setIsJoining(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("이벤트에 참여했어요");
    router.push(`/events/${result.data.eventId}`);
  }

  return (
    <div className="p-4">
      <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
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
      </div>

      <div className="space-y-4 py-6">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            {event.host.name}님의 초대
          </p>
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-foreground text-2xl font-bold">
              {event.title}
            </h1>
            <Badge className="shrink-0">{statusLabels[event.status]}</Badge>
          </div>
        </div>

        <div className="space-y-1.5">
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
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Users className="size-4 shrink-0" />
            <span>{event.participant_count}명 참여 중</span>
          </div>
        </div>

        {event.description && (
          <p className="text-foreground text-sm whitespace-pre-wrap">
            {event.description}
          </p>
        )}
      </div>

      <Button
        type="button"
        className="w-full"
        size="lg"
        onClick={handleJoin}
        disabled={isJoining}
      >
        {isJoining ? "참여하는 중..." : "참여하기"}
      </Button>
    </div>
  );
}
