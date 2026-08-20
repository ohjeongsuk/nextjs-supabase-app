"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EventForm } from "@/components/event-form";
import type { EventFormSchema } from "@/lib/schemas/event";

interface EditEventFormProps {
  eventId: string;
  defaultValues: Partial<EventFormSchema>;
}

export function EditEventForm({ eventId, defaultValues }: EditEventFormProps) {
  const router = useRouter();

  async function handleSubmit(values: EventFormSchema) {
    // TODO(Task 009): 이벤트 수정 API 연동
    console.log("이벤트 수정 요청", eventId, values);
    toast.success("이벤트가 수정되었어요");
    router.push(`/events/${eventId}`);
  }

  return (
    <EventForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitLabel="수정 완료"
      pendingLabel="수정 중..."
    />
  );
}
