import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardContent className="space-y-2 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </CardContent>
    </Card>
  );
}

export function EventCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ParticipantCardSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function ParticipantListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <ParticipantCardSkeleton key={index} />
      ))}
    </div>
  );
}
