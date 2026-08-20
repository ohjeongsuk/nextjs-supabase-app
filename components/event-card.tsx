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
          <Badge
            variant={statusVariants[event.status]}
            className="absolute right-2 top-2"
          >
            {statusLabels[event.status]}
          </Badge>
        </div>
        <CardContent className="space-y-2 p-4">
          <h3 className="line-clamp-1 font-semibold text-card-foreground">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span>
              {eventDate.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4 shrink-0" />
            <span>{event.participant_count}명 참여</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
