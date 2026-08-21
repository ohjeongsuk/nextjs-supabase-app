import { ProfileForm } from "@/components/profile-form";
import { currentMockUser } from "@/lib/mock/events";

export default function ProfilePage() {
  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold text-foreground">프로필</h1>
      <ProfileForm user={currentMockUser} />
    </div>
  );
}
