import { Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ParticipantWithUser } from "@/lib/types";

interface ParticipantCardProps {
  participant: ParticipantWithUser;
  className?: string;
}

export function ParticipantCard({
  participant,
  className,
}: ParticipantCardProps) {
  const { user, role } = participant;

  return (
    <div className={cn("flex items-center gap-3 py-2", className)}>
      <Avatar>
        <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-foreground">
          {user.name}
        </p>
        {role === "host" && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Crown className="size-3 text-primary" />
            주최자
          </span>
        )}
      </div>
    </div>
  );
}
