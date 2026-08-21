"use server";

import { revalidatePath } from "next/cache";
import {
  profileFormSchema,
  type ProfileFormSchema,
} from "@/lib/schemas/profile";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

export async function updateProfile(
  values: ProfileFormSchema,
): Promise<ActionResult<null>> {
  const parsed = profileFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "입력값을 다시 확인해주세요" };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요해요" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name: parsed.data.name })
    .eq("id", userId);

  if (error) {
    return { success: false, error: "프로필 수정에 실패했어요" };
  }

  revalidatePath("/profile");
  return { success: true, data: null };
}
