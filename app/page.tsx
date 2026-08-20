import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LandingHero } from "@/components/landing-hero";
import { createClient } from "@/lib/supabase/server";

async function RedirectIfAuthenticated() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/events");
  }

  return null;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto flex min-h-screen w-full max-w-app-frame flex-col bg-background">
        <Suspense>
          <RedirectIfAuthenticated />
        </Suspense>
        <LandingHero />
      </div>
    </div>
  );
}
