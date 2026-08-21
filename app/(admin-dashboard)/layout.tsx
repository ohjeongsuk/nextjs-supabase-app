import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted">
      <AdminSidebar />
      <main className="flex-1 bg-background p-6">{children}</main>
    </div>
  );
}
