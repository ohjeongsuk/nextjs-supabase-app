"use server";

import { revalidatePath } from "next/cache";
import { getAnalyticsSummary } from "@/lib/queries/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  ActionResult,
  AnalyticsPeriod,
  AnalyticsSummary,
} from "@/lib/types";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  if (!userId) {
    return { ok: false as const, error: "로그인이 필요해요" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: "권한이 없어요" };
  }

  return { ok: true as const, userId };
}

export async function deleteEventAsAdmin(
  eventId: string,
): Promise<ActionResult<null>> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("events").delete().eq("id", eventId);

  if (error) {
    return { success: false, error: "이벤트 삭제에 실패했어요" };
  }

  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");
  return { success: true, data: null };
}

export async function deleteUserAsAdmin(
  userId: string,
): Promise<ActionResult<null>> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  if (auth.userId === userId) {
    return { success: false, error: "자신은 삭제할 수 없어요" };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    return { success: false, error: "사용자 삭제에 실패했어요" };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true, data: null };
}

export async function fetchAnalyticsSummary(
  period: AnalyticsPeriod,
): Promise<ActionResult<AnalyticsSummary>> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const summary = await getAnalyticsSummary(period);
  return { success: true, data: summary };
}
