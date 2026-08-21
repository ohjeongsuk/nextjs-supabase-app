"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

const UNIQUE_VIOLATION = "23505";

export async function joinEvent(
  inviteCode: string,
): Promise<ActionResult<{ eventId: string }>> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요해요" };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (eventError || !event) {
    return { success: false, error: "이벤트를 찾을 수 없어요" };
  }

  const { error: insertError } = await supabase
    .from("event_participants")
    .insert({ event_id: event.id, user_id: userId, role: "participant" });

  if (insertError && insertError.code !== UNIQUE_VIOLATION) {
    return { success: false, error: "참여에 실패했어요" };
  }

  revalidatePath("/events");
  revalidatePath(`/events/${event.id}`);
  return { success: true, data: { eventId: event.id } };
}
