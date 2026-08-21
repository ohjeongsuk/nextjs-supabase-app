import { AdminEventTable } from "@/components/admin-event-table";
import { mockAdminEvents } from "@/lib/mock/admin";

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">이벤트 관리</h1>
      <AdminEventTable events={mockAdminEvents} />
    </div>
  );
}
