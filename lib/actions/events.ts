"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateInviteCode } from "@/lib/invite-code";
import { eventFormSchema, type EventFormSchema } from "@/lib/schemas/event";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

async function requireUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    redirect("/auth/login");
  }

  return { supabase, userId };
}

async function uploadCoverImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
): Promise<string> {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("event-covers")
    .upload(path, file);

  if (error) {
    throw new Error(`커버 이미지 업로드에 실패했어요: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("event-covers").getPublicUrl(path);

  return publicUrl;
}

export async function createEvent(
  values: EventFormSchema,
): Promise<ActionResult<{ id: string }>> {
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "입력값을 다시 확인해주세요" };
  }

  const { supabase, userId } = await requireUserId();

  let coverImageUrl: string | null = null;
  if (parsed.data.cover_image instanceof File) {
    try {
      coverImageUrl = await uploadCoverImage(
        supabase,
        userId,
        parsed.data.cover_image,
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "오류가 발생했어요",
      };
    }
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      location: parsed.data.location,
      event_date: new Date(parsed.data.event_date).toISOString(),
      cover_image_url: coverImageUrl,
      invite_code: generateInviteCode(),
      created_by: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: "이벤트 생성에 실패했어요" };
  }

  const { error: hostJoinError } = await supabase
    .from("event_participants")
    .insert({ event_id: data.id, user_id: userId, role: "host" });

  if (hostJoinError) {
    await supabase.from("events").delete().eq("id", data.id);
    return { success: false, error: "이벤트 생성에 실패했어요" };
  }

  revalidatePath("/events");
  return { success: true, data: { id: data.id } };
}

export async function updateEvent(
  eventId: string,
  values: EventFormSchema,
): Promise<ActionResult<{ id: string }>> {
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "입력값을 다시 확인해주세요" };
  }

  const { supabase, userId } = await requireUserId();

  let coverImageUrl: string | null | undefined;
  if (parsed.data.cover_image instanceof File) {
    try {
      coverImageUrl = await uploadCoverImage(
        supabase,
        userId,
        parsed.data.cover_image,
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "오류가 발생했어요",
      };
    }
  } else if (parsed.data.cover_image === null) {
    coverImageUrl = null;
  }

  const { data, error } = await supabase
    .from("events")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      location: parsed.data.location,
      event_date: new Date(parsed.data.event_date).toISOString(),
      ...(coverImageUrl !== undefined && { cover_image_url: coverImageUrl }),
    })
    .eq("id", eventId)
    .eq("created_by", userId)
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: "이벤트 수정에 실패했어요" };
  }

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  return { success: true, data: { id: data.id } };
}

export async function deleteEvent(
  eventId: string,
): Promise<ActionResult<null>> {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("created_by", userId);

  if (error) {
    return { success: false, error: "이벤트 삭제에 실패했어요" };
  }

  revalidatePath("/events");
  return { success: true, data: null };
}
