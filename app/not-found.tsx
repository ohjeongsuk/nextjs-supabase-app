import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <div className="bg-muted min-h-screen">
      <div className="max-w-app-frame bg-background mx-auto flex min-h-screen w-full flex-col items-center justify-center">
        <EmptyState
          icon={FileQuestion}
          title="페이지를 찾을 수 없어요"
          description="주소가 잘못되었거나 삭제된 페이지예요"
          action={
            <Button asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
