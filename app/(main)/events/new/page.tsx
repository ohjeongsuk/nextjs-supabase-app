"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EventForm } from "@/components/event-form";
import type { EventFormSchema } from "@/lib/schemas/event";

export default function NewEventPage() {
  const router = useRouter();

  async function handleSubmit(values: EventFormSchema) {
    // TODO(Task 009): 이벤트 생성 API 연동
    console.log("이벤트 생성 요청", values);
    toast.success("이벤트가 생성되었어요");
    router.push("/events");
  }

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        새 이벤트 만들기
      </h1>
      <EventForm
        onSubmit={handleSubmit}
        submitLabel="이벤트 생성"
        pendingLabel="생성 중..."
      />
    </div>
  );
}
