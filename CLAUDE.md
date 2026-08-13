# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 프로젝트 개요

Next.js 16 (App Router) + Supabase Auth 스타터 킷. `supabase-ssr`로 쿠키 기반 인증을 구성해 Client Components, Server Components, Route Handlers, Server Actions, Proxy(구 middleware) 전반에서 세션을 공유한다.

**주의**: `next`가 `package.json`에 `"latest"`로 고정되어 있어 설치 시점마다 실제 버전이 달라진다. `AGENTS.md`가 지시하는 대로, 코드를 작성하기 전에 `node_modules/next/dist/docs/`의 문서로 현재 설치된 버전의 실제 동작을 확인할 것 — 특히 async request API, Proxy, Cache Components 관련 breaking change는 버전마다 다르다.

## 자주 쓰는 명령어

```bash
npm run dev          # 개발 서버 (next dev)
npm run build         # 프로덕션 빌드
npm run start          # 프로덕션 서버 실행
npm run lint            # ESLint 검사 (eslint .)
```

단일 테스트 실행용 스크립트나 테스트 프레임워크는 아직 구성되어 있지 않다.

## 아키텍처

### 디렉토리 구조 — `src/` 없이 루트 배치

`docs/project-structure.md`는 `src/app`, `src/components` 구조를 전제로 설명하지만, **이 저장소의 실제 코드는 `src/` 없이 루트에 바로 위치**한다 (`app/`, `components/`, `lib/`). 새 파일을 추가할 때 문서보다 실제 구조를 따를 것.

- `app/` — App Router 라우트. `app/auth/*`는 로그인/회원가입/비밀번호 재설정 등 인증 페이지, `app/protected/`는 로그인이 필요한 페이지
- `components/` — 재사용 컴포넌트. `components/ui/`는 shadcn/ui 프리미티브(new-york 스타일), `components/tutorial/`은 스타터 킷 기본 튜토리얼 컴포넌트로 실제 기능 개발 시 삭제 대상
- `lib/supabase/` — Supabase 클라이언트 3종 + 타입
  - `client.ts` — 브라우저(Client Component)용 `createClient()`
  - `server.ts` — 서버(Server Component/Action)용 `createClient()`, 내부에서 `cookies()`를 await
  - `proxy.ts` — Proxy(옛 middleware)에서 세션을 갱신하는 `updateSession()`. **루트의 `proxy.ts`와 이름은 같지만 다른 파일**이니 혼동 주의
  - `types.ts` — Supabase 생성 타입 (`Database`)
- `proxy.ts` (루트) — Next.js가 자동 인식하는 특수 파일. `lib/supabase/proxy.ts`의 `updateSession`을 호출해 모든 요청에서 세션을 갱신하고, 미인증 사용자를 `/auth/login`으로 리다이렉트

### Next.js 16 Proxy (구 middleware)

Next 16부터 `middleware.ts` → `proxy.ts`, `middleware()` → `proxy()`로 이름이 바뀌었다. Node.js 런타임이 기본값. 이 저장소는 이미 새 컨벤션을 따르고 있으므로 `middleware`라는 이름을 되살리지 말 것. 상세 규칙은 `docs/nextjs-16.md`의 "Middleware → Proxy 전환" 섹션 참고.

### async request APIs

Next 16에서는 `params`, `searchParams`, `cookies()`, `headers()`의 동기 접근이 완전히 제거되어 빌드/런타임 에러가 난다. 항상 `await`할 것. `lib/supabase/server.ts`가 이 패턴의 참조 예시.

### Cache Components (`cacheComponents: true`)

`next.config.ts`에서 활성화되어 있다. 정적으로 결정되지 않는 데이터를 쓰는 컴포넌트는 `'use cache'`, `<Suspense>`, 또는 동적 렌더링 경계로 명시적으로 감싸야 한다 (`app/protected/page.tsx`의 `UserDetails`가 `<Suspense>` 경계를 쓰는 예시).

### 인증 흐름

1. `proxy.ts`가 모든 요청에서 `updateSession()`을 호출해 세션 쿠키를 갱신
2. `/`, `/login`, `/auth/*`를 제외한 경로에서 미인증 사용자는 `/auth/login`으로 리다이렉트
3. Server Component에서는 `lib/supabase/server.ts`의 `createClient()` + `supabase.auth.getClaims()`로 사용자 확인 (`app/protected/page.tsx` 참고)
4. `lib/utils.ts`의 `hasEnvVars`로 Supabase 환경변수 설정 여부를 체크해, 미설정 시 `<EnvVarWarning />` 등으로 안내

### 경로 별칭

`tsconfig.json`과 `components.json`에 정의된 별칭은 `@/*` → 루트 기준 (예: `@/components/ui/button`, `@/lib/utils`, `@/lib/supabase/server`). `@/hooks`도 별칭으로 등록되어 있지만 아직 `hooks/` 디렉토리는 없다.

## 코드 스타일 규칙 (docs/ 참고)

프로젝트에는 상세 가이드 문서가 있다. 해당 영역 작업 전 참고할 것:

- `docs/component-patterns.md` — Server/Client Component 경계, Props 설계, 컴파운드 컴포넌트 패턴
- `docs/styling-guide.md` — TailwindCSS + shadcn/ui 규칙, 시맨틱 색상 변수(`bg-background`, `text-foreground` 등) 사용, 다크모드 대응
- `docs/forms-react-hook-form.md` — React Hook Form + Zod + Server Actions 폼 패턴 (주의: 이 문서의 코드 예시는 `Form`, `Textarea`, `Select` 등 아직 설치되지 않은 shadcn/ui 컴포넌트를 전제로 하므로 그대로 복사하면 빌드 에러가 남 — 실제 설치된 컴포넌트는 `components/ui/`를 확인)
- `docs/nextjs-16.md` — Next.js 16 breaking change 전반 (Proxy 전환, async API, Typed Routes, Cache Components)

핵심 공통 규칙:
- Server Components가 기본값. `'use client'`는 상태/이벤트 핸들러가 실제로 필요할 때만 최소 범위로 적용
- Pages Router 패턴(`pages/`, `getServerSideProps`, `getStaticProps`) 사용 금지
- 시맨틱 Tailwind 색상 변수 사용, 하드코딩된 색상(`bg-white`, `text-gray-900` 등) 금지
- shadcn/ui 컴포넌트 추가는 `npx shadcn@latest add [component-name]`
