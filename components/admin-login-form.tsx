import { ShieldCheck } from "lucide-react";
import { GoogleLoginButton } from "@/components/google-login-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminLoginFormProps {
  error?: string;
}

export function AdminLoginForm({ error }: AdminLoginFormProps) {
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
        <GoogleLoginButton next="/admin/dashboard" />
        {error === "forbidden" && (
          <p className="mt-3 text-center text-sm text-destructive">
            관리자 권한이 없습니다
          </p>
        )}
      </CardContent>
    </Card>
  );
}
