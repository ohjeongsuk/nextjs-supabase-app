# 폼 작성 가이드 (Client Component + Supabase 직접 호출)

이 문서는 이 프로젝트에서 실제로 사용 중인 폼 패턴을 설명합니다. `components/login-form.tsx`, `components/sign-up-form.tsx`, `components/forgot-password-form.tsx`, `components/update-password-form.tsx`가 모두 아래와 동일한 구조를 따릅니다.

> ⚠️ 이 프로젝트에는 `react-hook-form`, `zod`, `@hookform/resolvers`, shadcn/ui `Form`/`Textarea`/`Select` 컴포넌트가 **설치되어 있지 않습니다**. 인증 폼은 React Hook Form 없이 `useState`로 상태를 관리하고, Server Action이 아니라 `lib/supabase/client.ts`의 `createClient()`를 클라이언트에서 직접 호출해 Supabase Auth API를 부릅니다. 새 폼을 추가할 때는 아래 실제 패턴을 따르세요.

## 🚀 기본 패턴: Client Component + useState + Supabase 직접 호출

### 구조 요약

1. 파일 최상단에 `"use client"` (폼은 `onChange`/`onSubmit` 상호작용이 필요하므로 Client Component)
2. 각 입력 필드를 `useState`로 관리
3. 로딩 상태(`isLoading`)와 에러 상태(`error: string | null`)를 별도 관리
4. `onSubmit` 핸들러에서 `e.preventDefault()` → `lib/supabase/client.ts`의 `createClient()`로 브라우저 클라이언트 생성 → `supabase.auth.*` 메서드 호출
5. 성공 시 `useRouter()`의 `router.push()`로 이동, 실패 시 `catch`에서 에러 메시지를 `error` 상태에 저장
6. `shadcn/ui`의 `Card`, `Input`, `Label`, `Button`으로 마크업 구성

### 예시: 로그인 폼 (`components/login-form.tsx` 기준)

```tsx
"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 다른 인증 폼과의 차이점

- **`components/sign-up-form.tsx`**: `password`/`repeatPassword` 두 필드를 비교하는 클라이언트 측 검증(`if (password !== repeatPassword)`)을 `supabase.auth.signUp()` 호출 전에 수행. 회원가입 성공 시 `/auth/sign-up-success`로 이동
- **`components/forgot-password-form.tsx`**: `supabase.auth.resetPasswordForEmail()` 호출, 성공/실패를 별도 상태(`success`)로 관리해 같은 화면에서 안내 메시지 전환
- **`components/update-password-form.tsx`**: `supabase.auth.updateUser({ password })` 호출. 비밀번호 재설정 링크로 진입했을 때만 유효한 세션을 전제로 함

## ✅ 새 폼 작성 시 체크리스트

1. `"use client"` 선언
2. 필드별 `useState`, 그리고 `error`(`string | null`), `isLoading`(`boolean`) 상태
3. `lib/supabase/client.ts`의 `createClient()`를 함수 컴포넌트 내부(핸들러 안)에서 호출 — 모듈 스코프에 캐싱하지 말 것
4. `try { ... } catch (error: unknown) { setError(error instanceof Error ? error.message : "An error occurred") } finally { setIsLoading(false) }` 형태로 통일
5. 서버 쪽 검증이 필요한 값(예: 비밀번호 정책)은 Supabase Auth 설정 또는 별도 Route Handler에서 처리 — 이 프로젝트는 커스텀 Server Action 기반 검증 계층을 두지 않음
6. 마크업은 `Card` + `Label` + `Input` + `Button` 조합을 그대로 재사용, 새 스타일을 직접 만들지 않기

## 🚫 이 프로젝트에 적용하면 안 되는 패턴

다음은 흔히 볼 수 있는 Next.js 폼 패턴이지만, **이 저장소의 실제 스택과 맞지 않으므로 그대로 가져오지 마세요**:

- `useForm()` (react-hook-form), `zodResolver`, `z.object(...)` 스키마 — 패키지가 설치되어 있지 않음
- `useActionState` + `'use server'` 액션으로 폼 제출을 처리하는 패턴 — 인증 폼은 전부 클라이언트에서 Supabase SDK를 직접 호출함
- `<Form>`, `<FormField>`, `<FormControl>`, `<FormMessage>`, `<Textarea>`, `<Select>` — 아직 `npx shadcn@latest add`로 설치되지 않은 컴포넌트. 실제 설치된 목록은 `components/ui/`를 확인 (`badge`, `button`, `card`, `checkbox`, `dropdown-menu`, `input`, `label`)

이런 패턴이 실제로 필요해지면(복잡한 다단계 폼, 서버 측 재검증이 반드시 필요한 폼 등) 먼저 필요한 패키지를 설치하고 이 문서를 갱신한 뒤 적용하세요.

## ⚠️ 보안 참고사항

- 비밀번호 검증, 이메일 형식 검증 등은 Supabase Auth가 서버 측에서도 수행합니다. 클라이언트의 `required`, `type="email"` 같은 HTML5 검증은 UX 보조 수단일 뿐 신뢰할 수 있는 검증이 아닙니다.
- Supabase 세션 쿠키 갱신은 `proxy.ts` → `lib/supabase/proxy.ts`의 `updateSession()`이 모든 요청에서 처리합니다. 폼 컴포넌트에서 별도로 세션/쿠키를 다룰 필요는 없습니다.
