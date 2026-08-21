import { Suspense } from "react";
import { AdminEventTable } from "@/components/admin-event-table";
import { getAdminEvents } from "@/lib/queries/admin";

async function AdminEventsContent() {
  const events = await getAdminEvents();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">이벤트 관리</h1>
      <AdminEventTable events={events} />
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <Suspense>
      <AdminEventsContent />
    </Suspense>
  );
}
