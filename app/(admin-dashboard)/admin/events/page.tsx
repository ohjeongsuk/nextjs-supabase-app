import { Suspense } from "react";
import { AdminEventTable } from "@/components/admin-event-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminEvents } from "@/lib/queries/admin";

function AdminEventsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-11 w-full sm:max-w-xs" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
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

async function AdminEventsContent() {
  const events = await getAdminEvents();

  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-2xl font-bold">이벤트 관리</h1>
      <AdminEventTable events={events} />
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <Suspense fallback={<AdminEventsSkeleton />}>
      <AdminEventsContent />
    </Suspense>
  );
}
