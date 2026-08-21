import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JoinEventCard } from "@/components/join-event-card";
import { getEventByInviteCode } from "@/lib/queries/events";

type Props = {
  params: Promise<{ invite_code: string }>;
};

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
    <Suspense>
      <JoinPageContent params={params} />
    </Suspense>
  );
}
