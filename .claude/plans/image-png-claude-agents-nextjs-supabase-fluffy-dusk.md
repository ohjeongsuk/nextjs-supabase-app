# 구글 로그인(Google OAuth) 기능 추가

## Context

현재 이 프로젝트는 Supabase Auth의 이메일/비밀번호 인증만 구현되어 있고(`components/login-form.tsx`, `components/sign-up-form.tsx`), 소셜 로그인 관련 코드는 전무하다. 사용자가 구글 로그인 버튼을 로그인/회원가입 폼 양쪽에 추가하고 싶어 한다.

이 프로젝트는 `@supabase/ssr` 기반 쿠키 세션(PKCE flow)을 쓰고 있으므로, 단순히 `signInWithOAuth`만 호출해서는 세션이 생기지 않는다. Google 동의 화면 → Supabase → 앱으로 돌아올 때 전달되는 `code` 파라미터를 `exchangeCodeForSession()`으로 교환해 쿠키에 세션을 심어주는 **콜백 라우트**가 별도로 필요하다. 기존 `app/auth/confirm/route.ts`는 이메일 매직링크 전용(`verifyOtp` 방식)이라 메커니즘이 달라 재사용할 수 없다 — Supabase 공식 Next.js 가이드도 이 두 흐름을 별도 라우트로 분리해서 안내한다.

## 사전 준비 (사용자 작업, 코드 범위 밖)

Google Cloud Console에서 OAuth Client ID 발급 → Supabase 대시보드(Authentication > Providers > Google)에 Client ID/Secret 등록이 아직 안 되어 있다고 확인됨. 이 작업은 코드로 대신할 수 없으므로, 구현 후 실제로 "Google로 로그인" 버튼을 눌러 테스트하려면 사용자가 다음을 먼저 완료해야 한다:
1. Google Cloud Console에서 Web application 타입 OAuth Client 생성
2. Authorized redirect URI에 Supabase 콜백 URL(`https://hncdzcfrywkqydslkmkm.supabase.co/auth/v1/callback`) 등록
3. Supabase 대시보드 Google Provider 설정에 Client ID/Secret 입력 및 활성화

이 부분은 계획 실행과 별개로, 구현 완료 후 사용자에게 안내만 하고 진행한다(코드는 Provider 활성화 여부와 무관하게 먼저 작성 가능).

## 구현 범위

### 1. 콜백 라우트 신설 — `app/auth/callback/route.ts`

Supabase 공식 Next.js 가이드의 표준 패턴을 이 프로젝트의 클라이언트 생성 방식(`@/lib/supabase/server`)에 맞춰 적용한다.

- `code` 쿼리 파라미터를 받아 `supabase.auth.exchangeCodeForSession(code)` 호출
- `next` 쿼리 파라미터(기본값 `/protected`)로 성공 후 이동할 경로 지정, `next`가 `/`로 시작하지 않으면 기본값으로 폴백
- 실패 시 기존 `app/auth/error` 페이지로 리다이렉트 (이미 있는 `?error=` 쿼리 규약을 그대로 따름 — `app/auth/confirm/route.ts`와 동일한 패턴)
- `x-forwarded-host` 처리 등 프록시 환경 대응 로직은 이 프로젝트가 로컬/단일 Vercel 배포로 보이므로 과도한 일반화 없이 `origin` 기준으로 단순하게 작성

이 경로는 `/auth`로 시작하므로 `lib/supabase/proxy.ts`의 리다이렉트 예외 조건(`!request.nextUrl.pathname.startsWith("/auth")`)에 이미 해당되어 **proxy.ts 수정은 불필요**하다.

### 2. Google 로그인 버튼 컴포넌트 — `components/google-login-button.tsx` (신규)

`login-form.tsx`/`sign-up-form.tsx` 양쪽에서 재사용할 공용 클라이언트 컴포넌트로 분리한다(두 폼에 동일 로직을 복붙하지 않기 위함).

- `lib/supabase/client.ts`의 `createClient()`로 브라우저 클라이언트 생성
- `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: \`${window.location.origin}/auth/callback?next=/protected\` } })` 호출
- 기존 폼과 통일된 로딩/에러 상태 패턴 사용 (에러는 상위 폼에 콜백으로 전달하거나, 버튼 자체에서 최소한의 에러만 표시)
- `components/ui/button.tsx`의 `variant="outline"` 사용 (기존 `buttonVariants`가 `[&_svg]:size-4`를 지원하므로 구글 브랜드 아이콘 SVG를 인라인으로 넣어 자연스럽게 스타일링)
- 구글 로고는 공식 브랜드 가이드라인에 맞는 다색 "G" 아이콘 SVG를 인라인으로 삽입(외부 이미지 요청 없이 self-contained)

### 3. `login-form.tsx` / `sign-up-form.tsx` 수정

- 기존 `<Button type="submit">` 아래, "Sign up"/"Login" 링크 위에 구분선("또는")과 `<GoogleLoginButton />`을 추가
- 기존 상태 관리(`isLoading`, `error`) 구조는 건드리지 않고, 새 컴포넌트를 그대로 삽입

### 4. `app/auth/error/page.tsx`

기존 그대로 재사용 — 이미 `?error=` 쿼리로 메시지를 표시하는 구조이므로 수정 불필요.

## 변경/신규 파일 요약

| 파일 | 작업 |
|---|---|
| `app/auth/callback/route.ts` | 신규 — OAuth 콜백 처리 (`exchangeCodeForSession`) |
| `components/google-login-button.tsx` | 신규 — 재사용 가능한 구글 로그인 버튼 |
| `components/login-form.tsx` | 수정 — 구분선 + `GoogleLoginButton` 추가 |
| `components/sign-up-form.tsx` | 수정 — 구분선 + `GoogleLoginButton` 추가 |

## 검증 방법

1. `npm run typecheck`, `npm run lint`로 정적 검사
2. `npm run dev` 실행 후 `/auth/login`, `/auth/sign-up` 페이지에서 구글 버튼이 기존 폼과 시각적으로 통일되게 렌더링되는지 확인
3. Supabase 대시보드에 Google Provider가 아직 설정되지 않았다면, 버튼 클릭 시 Supabase가 반환하는 에러(`provider is not enabled` 등)가 `app/auth/error` 페이지에 정상 표시되는지 확인 — 즉 Provider 미설정 상태에서도 앱이 크래시 없이 에러를 우아하게 처리하는지 검증
4. (사용자가 Provider 설정을 완료한 이후) 실제 구글 계정으로 로그인 → `/protected`로 정상 리다이렉트되고 세션 쿠키가 생성되는지 브라우저에서 직접 확인 — 필요시 `mcp__playwright__*`로 골든 패스 자동 확인
