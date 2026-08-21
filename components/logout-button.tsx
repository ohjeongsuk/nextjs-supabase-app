"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  className?: string;
  redirectTo?: string;
}

export function LogoutButton({
  className,
  redirectTo = "/",
}: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
  };

  return (
    <Button onClick={logout} className={className}>
      로그아웃
    </Button>
  );
}
