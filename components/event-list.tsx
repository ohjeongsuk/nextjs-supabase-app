"use client";

import { CalendarX } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { cn } from "@/lib/utils";
import type { EventStatusFilter, EventWithParticipants } from "@/lib/types";

const filterTabs: { value: EventStatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행 중" },
  { value: "ended", label: "종료" },
];

interface EventListProps {
  events: EventWithParticipants[];
  emptyTitle: string;
  emptyDescription?: string;
}

export function EventList({
  events,
  emptyTitle,
  emptyDescription,
}: EventListProps) {
  const [filter, setFilter] = useState<EventStatusFilter>("all");

  const filteredEvents = useMemo(
    () =>
      filter === "all"
        ? events
        : events.filter((event) => event.status === filter),
    [events, filter],
  );

  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "h-8 shrink-0 rounded-full border px-3 text-sm font-medium transition-colors",
              filter === tab.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="해당 상태의 이벤트가 없어요"
          description="다른 필터를 선택해보세요"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
