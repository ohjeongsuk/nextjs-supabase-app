import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/types";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  const email = claimsData?.claims.email;

  if (!userId) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) return null;

  return {
    id: profile.id,
    email: email ?? "",
    name: profile.name,
    avatar_url: profile.avatar_url,
    role: profile.role === "admin" ? "admin" : "user",
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}
