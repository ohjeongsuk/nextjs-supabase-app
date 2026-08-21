import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

async function AdminLoginContent({ searchParams }: Props) {
  const { error } = await searchParams;

  return <AdminLoginForm error={error} />;
}

export default function AdminLoginPage({ searchParams }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Suspense>
        <AdminLoginContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
