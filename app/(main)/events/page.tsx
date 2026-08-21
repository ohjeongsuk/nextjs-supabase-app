import { Suspense } from "react";
import { EventsPageContent } from "@/components/events-page-content";
import { getHostedEvents, getJoinedEvents } from "@/lib/queries/events";
import { createClient } from "@/lib/supabase/server";

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
    <Suspense>
      <EventsPageData />
    </Suspense>
  );
}
