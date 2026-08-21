import { Suspense } from "react";
import { AdminUserTable } from "@/components/admin-user-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminUsers } from "@/lib/queries/admin";
import { createClient } from "@/lib/supabase/server";

function AdminUsersSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-11 w-full sm:max-w-xs" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
      <div className="space-y-2 rounded-md border p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

async function AdminUsersContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const currentUserId = data?.claims.sub ?? "";

  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-2xl font-bold">사용자 관리</h1>
      <AdminUserTable users={users} currentUserId={currentUserId} />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminUsersSkeleton />}>
      <AdminUsersContent />
    </Suspense>
  );
}
