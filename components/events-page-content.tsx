"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EventList } from "@/components/event-list";
import { cn } from "@/lib/utils";
import type { EventWithParticipants } from "@/lib/types";

type EventRoleTab = "hosted" | "joined";

const roleTabs: { value: EventRoleTab; label: string }[] = [
  { value: "hosted", label: "내가 만든 이벤트" },
  { value: "joined", label: "내가 참여한 이벤트" },
];

interface EventsPageContentProps {
  hostedEvents: EventWithParticipants[];
  joinedEvents: EventWithParticipants[];
}

export function EventsPageContent({
  hostedEvents,
  joinedEvents,
}: EventsPageContentProps) {
  const [roleTab, setRoleTab] = useState<EventRoleTab>("hosted");
  const events = roleTab === "hosted" ? hostedEvents : joinedEvents;

  return (
    <div className="relative p-4">
      <h1 className="text-foreground mb-4 text-2xl font-bold">내 이벤트</h1>

      <div className="mb-4 flex gap-2">
        {roleTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setRoleTab(tab.value)}
            className={cn(
              "h-9 flex-1 rounded-full border text-sm font-medium transition-colors",
              roleTab === tab.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <EventList
        events={events}
        emptyTitle={
          roleTab === "hosted"
            ? "아직 만든 이벤트가 없어요"
            : "아직 참여한 이벤트가 없어요"
        }
        emptyDescription={
          roleTab === "hosted"
            ? "새 이벤트를 만들고 사람들을 초대해보세요"
            : "초대 링크를 받으면 이벤트에 참여할 수 있어요"
        }
      />

      {roleTab === "hosted" && (
        <div className="max-w-app-frame fixed bottom-20 left-1/2 z-40 w-full -translate-x-1/2 px-4">
          <Link
            href="/events/new"
            className="bg-primary text-primary-foreground ml-auto flex size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
            aria-label="새 이벤트 만들기"
          >
            <Plus className="size-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
