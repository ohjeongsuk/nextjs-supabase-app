import { Plus } from "lucide-react";
import Link from "next/link";
import { EventList } from "@/components/event-list";
import { mockEvents } from "@/lib/mock/events";

export default function EventsPage() {
  return (
    <div className="relative p-4">
      <h1 className="mb-4 text-2xl font-bold text-foreground">내 이벤트</h1>

      <EventList
        events={mockEvents}
        emptyTitle="아직 만든 이벤트가 없어요"
        emptyDescription="새 이벤트를 만들고 사람들을 초대해보세요"
      />

      <div className="fixed bottom-20 left-1/2 z-40 w-full max-w-app-frame -translate-x-1/2 px-4">
        <Link
          href="/events/new"
          className="ml-auto flex size-14 w-fit items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          aria-label="새 이벤트 만들기"
        >
          <Plus className="size-6" />
        </Link>
      </div>
    </div>
  );
}
