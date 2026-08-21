import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditEventForm } from "@/components/edit-event-form";
import { getEventById } from "@/lib/queries/events";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

function toDatetimeLocalValue(isoString: string) {
  const date = new Date(isoString);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

async function EditEventContent({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  const event = await getEventById(id).catch(() => null);

  if (!event || event.created_by !== userId) {
    notFound();
  }

  return (
    <div className="p-4">
      <h1 className="text-foreground mb-6 text-2xl font-bold">이벤트 수정</h1>
      <EditEventForm
        eventId={event.id}
        defaultValues={{
          title: event.title,
          description: event.description ?? "",
          location: event.location,
          event_date: toDatetimeLocalValue(event.event_date),
          cover_image: event.cover_image_url,
        }}
      />
    </div>
  );
}

export default function EditEventPage({ params }: Props) {
  return (
    <Suspense>
      <EditEventContent params={params} />
    </Suspense>
  );
}
