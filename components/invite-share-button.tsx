"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface InviteShareButtonProps {
  inviteCode: string;
}

export function InviteShareButton({ inviteCode }: InviteShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("초대 링크가 복사되었어요");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("링크 복사에 실패했어요");
    }
  }

  async function handleShare() {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;

    if (navigator.share) {
      try {
        await navigator.share({ url: inviteUrl });
      } catch {
        // 사용자가 공유를 취소한 경우 무시
      }
      return;
    }

    await handleCopy();
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={handleCopy}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        링크 복사
      </Button>
      <Button
        type="button"
        variant="default"
        className="flex-1"
        onClick={handleShare}
      >
        <Share2 className="size-4" />
        공유하기
      </Button>
    </div>
  );
}
