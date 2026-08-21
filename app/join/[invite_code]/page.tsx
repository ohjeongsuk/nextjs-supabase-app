import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JoinEventCard } from "@/components/join-event-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventByInviteCode } from "@/lib/queries/events";

type Props = {
  params: Promise<{ invite_code: string }>;
};

function JoinPageSkeleton() {
  return (
    <div className="p-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-4 py-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-2/3" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

async function JoinPageContent({ params }: Props) {
  const { invite_code } = await params;
  const event = await getEventByInviteCode(invite_code).catch(() => null);

  if (!event) {
    notFound();
  }

  return <JoinEventCard event={event} />;
}

export default function JoinPage({ params }: Props) {
  return (
    <Suspense fallback={<JoinPageSkeleton />}>
      <JoinPageContent params={params} />
    </Suspense>
  );
}
