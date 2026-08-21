import { Suspense } from "react";
import { AdminUserTable } from "@/components/admin-user-table";
import { getAdminUsers } from "@/lib/queries/admin";
import { createClient } from "@/lib/supabase/server";

async function AdminUsersContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const currentUserId = data?.claims.sub ?? "";

  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">사용자 관리</h1>
      <AdminUserTable users={users} currentUserId={currentUserId} />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense>
      <AdminUsersContent />
    </Suspense>
  );
}
