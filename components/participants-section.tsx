"use client";

import { useEffect, useState } from "react";
import { ParticipantCard } from "@/components/participant-card";
import { createClient } from "@/lib/supabase/client";
import type { ParticipantWithUser } from "@/lib/types";

interface ParticipantsSectionProps {
  eventId: string;
  initialParticipants: ParticipantWithUser[];
}

export function ParticipantsSection({
  eventId,
  initialParticipants,
}: ParticipantsSectionProps) {
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`event-participants-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", payload.new.user_id)
            .single();

          if (!profile) return;

          setParticipants((current) => {
            if (current.some((p) => p.id === payload.new.id)) return current;
            return [
              ...current,
              {
                id: payload.new.id,
                event_id: payload.new.event_id,
                user_id: payload.new.user_id,
                role: payload.new.role === "host" ? "host" : "participant",
                joined_at: payload.new.joined_at,
                user: {
                  id: profile.id,
                  email: "",
                  name: profile.name,
                  avatar_url: profile.avatar_url,
                  role: profile.role === "admin" ? "admin" : "user",
                  created_at: profile.created_at,
                  updated_at: profile.updated_at,
                },
              },
            ];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          setParticipants((current) =>
            current.filter((p) => p.id !== payload.old.id),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return (
    <div>
      <h2 className="mb-2 font-semibold text-foreground">
        참여자 {participants.length}명
      </h2>
      <div>
        {participants.map((participant) => (
          <ParticipantCard key={participant.id} participant={participant} />
        ))}
      </div>
    </div>
  );
}
