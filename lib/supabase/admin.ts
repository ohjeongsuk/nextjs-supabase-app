import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * service_role 키로 RLS를 우회하는 서버 전용 클라이언트.
 * Server Component/Server Action에서만 import할 것 — 절대 'use client' 파일에서 사용 금지.
 * 호출부는 반드시 admin 권한을 직접 재검증한 뒤에만 이 클라이언트를 사용해야 한다.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
