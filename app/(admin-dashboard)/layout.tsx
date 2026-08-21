import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  return (
    <div className="flex min-h-screen bg-muted">
      <AdminSidebar />
      <main className="flex-1 bg-background p-6">{children}</main>
    </div>
  );
}
