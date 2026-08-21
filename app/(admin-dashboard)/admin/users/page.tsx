import { AdminUserTable } from "@/components/admin-user-table";
import { mockAdminUsers } from "@/lib/mock/admin";

const currentMockAdminId = "user-4";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">사용자 관리</h1>
      <AdminUserTable
        users={mockAdminUsers}
        currentUserId={currentMockAdminId}
      />
    </div>
  );
}
