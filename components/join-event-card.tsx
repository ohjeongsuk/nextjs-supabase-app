"use client";

import { CalendarDays, MapPin, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    // TODO(Task 010): 초대 링크 참여 API 연동
    console.log("이벤트 참여 요청", event.id);
    toast.success("이벤트에 참여했어요");
    router.push(`/events/${event.id}`);
  }

  return (
    <div className="p-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
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

      <div className="space-y-4 py-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {event.host.name}님의 초대
          </p>
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
        </div>

        <div className="space-y-1.5">
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
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4 shrink-0" />
            <span>{event.participant_count}명 참여 중</span>
          </div>
        </div>

        {event.description && (
          <p className="whitespace-pre-wrap text-sm text-foreground">
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
