import { Suspense } from "react";
import { EventsPageContent } from "@/components/events-page-content";
import { EventCardSkeletonGrid } from "@/components/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { getHostedEvents, getJoinedEvents } from "@/lib/queries/events";
import { createClient } from "@/lib/supabase/server";

function EventsPageSkeleton() {
  return (
    <div className="p-4">
      <Skeleton className="mb-4 h-8 w-32" />
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-full" />
        <Skeleton className="h-9 flex-1 rounded-full" />
      </div>
      <EventCardSkeletonGrid count={4} />
    </div>
  );
}

async function EventsPageData() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    return <EventsPageContent hostedEvents={[]} joinedEvents={[]} />;
  }

  const [hostedEvents, joinedEvents] = await Promise.all([
    getHostedEvents(userId),
    getJoinedEvents(userId),
  ]);

  return (
    <EventsPageContent
      hostedEvents={hostedEvents}
      joinedEvents={joinedEvents}
    />
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsPageData />
    </Suspense>
  );
}
