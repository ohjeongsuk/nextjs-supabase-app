"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-muted min-h-screen">
      <div className="max-w-app-frame bg-background mx-auto flex min-h-screen w-full flex-col items-center justify-center">
        <EmptyState
          icon={AlertTriangle}
          title="문제가 발생했어요"
          description="잠시 후 다시 시도해주세요"
          action={<Button onClick={retry}>다시 시도</Button>}
        />
      </div>
    </div>
  );
}
