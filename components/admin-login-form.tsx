"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setIsLoading(true);
    setError(null);
    // TODO(Task 008): Google OAuth 로그인 후 role !== "admin"이면 접근 거부 처리
    setError("관리자 권한이 없습니다");
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">관리자 로그인</CardTitle>
        <CardDescription>
          관리자 계정으로 Google 로그인을 진행해주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={handleGoogleLogin}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
              fill="#4285F4"
            />
            <path
              d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09C3.25 21.3 7.31 24 12 24z"
              fill="#34A853"
            />
            <path
              d="M5.27 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.64H1.27C.46 8.24 0 10.06 0 12s.46 3.76 1.27 5.36l4-3.09z"
              fill="#FBBC05"
            />
            <path
              d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.64l4 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
              fill="#EA4335"
            />
          </svg>
          {isLoading ? "이동 중..." : "Google로 시작하기"}
        </Button>
        {error && (
          <p className="mt-3 text-center text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
