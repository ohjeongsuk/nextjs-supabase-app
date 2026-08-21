import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProfileForm } from "@/components/profile-form";
import { getCurrentUser } from "@/lib/queries/profile";

async function ProfilePageContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <ProfileForm user={user} />;
}

export default function ProfilePage() {
  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold text-foreground">프로필</h1>
      <Suspense>
        <ProfilePageContent />
      </Suspense>
    </div>
  );
}
