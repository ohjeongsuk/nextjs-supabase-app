import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditEventForm } from "@/components/edit-event-form";
import { getMockEventById } from "@/lib/mock/events";

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
  const event = getMockEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold text-foreground">이벤트 수정</h1>
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
