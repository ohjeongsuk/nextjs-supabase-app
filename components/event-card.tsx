import { CalendarDays, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EventStatus, EventWithParticipants } from "@/lib/types";

const statusLabels: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

const statusVariants: Record<EventStatus, "default" | "secondary" | "outline"> =
  {
    upcoming: "default",
    ongoing: "secondary",
    ended: "outline",
  };

interface EventCardProps {
  event: EventWithParticipants;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const eventDate = new Date(event.event_date);

  return (
    <Link href={`/events/${event.id}`}>
      <Card
        className={cn(
          "overflow-hidden transition-shadow hover:shadow-md",
          className,
        )}
      >
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
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-card-foreground line-clamp-1 font-semibold">
              {event.title}
            </h3>
            <Badge variant={statusVariants[event.status]} className="shrink-0">
              {statusLabels[event.status]}
            </Badge>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <CalendarDays className="size-4 shrink-0" />
            <span>
              {eventDate.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <MapPin className="size-4 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Users className="size-4 shrink-0" />
            <span>{event.participant_count}명 참여</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
