# Task 015: 배포 및 모니터링

## 개요

- **목표**: 프로덕션 배포에 필요한 코드/설정을 준비한다. 실제 계정 연동(Vercel 프로젝트 생성, Sentry/GA 계정 발급, 실배포)은 외부 서비스 콘솔에서 사용자가 직접 진행해야 하는 영역이라 이번 세션 범위에서 제외한다.
- **예상 소요 시간**: 반나절 (코드 준비만), 실제 배포는 사용자의 계정 작업 이후 별도 세션
- **관련 기능**: 전체 배포 파이프라인 (특정 F 없음)
- **의존성**: Phase 4 전체(Task 013, 014) 완료

## 배경 / 현재 상태

- GitHub 원격 저장소(`ohjeongsuk/nextjs-supabase-app`)는 이미 연결되어 있음
- Vercel 프로젝트, `.vercel/` 디렉터리, `vercel.json` 모두 없음 — Next.js는 Vercel의 zero-config 배포 대상이라 별도 `vercel.json` 없이도 배포 가능하지만, 빌드 명령/환경변수 안내를 위해 최소 설정 파일을 추가
- `.github/workflows/` 디렉터리 없음 — CI 파이프라인 미구축
- `app/error.tsx`(라우트 세그먼트 에러 바운더리)는 Task 013에서 구현됨. `app/global-error.tsx`(루트 레이아웃 자체의 크래시를 잡는 최상위 에러 바운더리, Sentry 연동 시 표준적으로 필요)는 없음
- Sentry, Google Analytics 관련 SDK/설정 전혀 없음
- `.env.local`에 Supabase 관련 키 3종(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)만 존재

## 이번 세션 범위 (사용자 확인: "코드/설정만 먼저 준비")

- Vercel 계정 로그인/프로젝트 생성/실제 배포는 미착수 — 사용자가 Vercel 콘솔에서 GitHub 저장소를 Import하는 방식을 권장 (CLI 로그인 불필요)
- Sentry/GA 계정 발급 및 실제 DSN/측정 ID 발급도 미착수 — 코드는 환경변수가 비어있어도 빌드/실행에 지장 없도록 조건부로 작성
- CI(GitHub Actions)는 lint/typecheck/build 검증까지만 구축. 실배포(CD)는 Vercel의 Git 연동이 담당하므로 별도 배포 워크플로우는 만들지 않음

## 구현 사항

- [x] `vercel.json` 생성 — 빌드 명령, 프레임워크 명시 등 최소 설정
- [x] `.env.example` 생성 — 필요한 환경변수 키 목록(값 없이) 문서화, Vercel 프로젝트 설정 시 참고용
- [x] `.github/workflows/ci.yml` 생성 — push/PR 시 `npm ci` → lint → typecheck → build 자동 실행 (build 단계는 Supabase 키 3종을 GitHub Secrets로 주입)
- [x] `@sentry/nextjs` 설치. Context7로 최신 문서 확인 결과 App Router + Turbopack 매뉴얼 설정은 `sentry.client.config.ts`가 아닌 `instrumentation-client.ts` + `sentry.server.config.ts` + `sentry.edge.config.ts` + `instrumentation.ts`(register/onRequestError) 4개 파일 조합임을 확인, 이에 맞춰 작성 — `NEXT_PUBLIC_SENTRY_DSN`이 비어있으면 `enabled: false`로 초기화 스킵
- [x] `app/global-error.tsx` 신규 생성 — 루트 레이아웃 크래시 시 `Sentry.captureException`으로 리포트 + 최소한의 폴백 UI (자체 `<html>/<body>` 포함)
- [x] `next.config.ts`에 Sentry 빌드 플러그인 연동 (`withSentryConfig`) — `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` 미설정 시 소스맵 업로드만 건너뛰고 빌드는 정상 진행되는 것을 실제 빌드로 확인
- [x] Google Analytics — `@next/third-parties/google`(Next.js 버전과 맞춰 16.3.0 설치)의 `GoogleAnalytics` 컴포넌트를 `app/layout.tsx`에 조건부 추가, 측정 ID 없을 때 스크립트 미삽입을 curl로 확인
- [x] `docs/deployment.md` 작성 — Vercel 프로젝트 생성부터 환경변수 등록, GitHub Secrets, Sentry/GA 계정 발급, 커스텀 도메인, 배포 후 Lighthouse 측정까지 단계별 안내
- [x] `.gitignore`에 Sentry 로컬 아티팩트(`.sentryclirc`, `.env.sentry-build-plugin`) 추가

## 수락 기준

- `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 `.env.local`에 없어도 `npm run build`와 `npm run dev`가 정상 동작한다 — ✅ 빌드 성공(`runAfterProductionCompile` 포함), dev 서버 재기동 후 `/events`·`/auth/login` 200 확인
- `npm run typecheck`, `npm run build` 모두 통과한다 — ✅. `npm run lint`는 Task 014에서 발견한 기존 이슈(`components/theme-switcher.tsx`, 범위 밖) 1건만 남아있고 이번 세션 신규 파일은 lint 통과
- GitHub Actions 워크플로우는 표준 `actions/checkout`, `actions/setup-node` 액션과 `npm run` 스크립트만 사용해 문법 오류 여지가 낮음 — 실제 실행 결과는 push 후 사용자가 Actions 탭에서 확인 필요
- `docs/deployment.md`를 따라가면 실제 배포까지 완료할 수 있을 만큼 구체적이다 — ✅ 작성 완료, 6단계(Vercel/CI Secrets/Sentry/GA/도메인/Lighthouse)로 구성

## 관련 파일

- `vercel.json` (신규)
- `.env.example` (신규)
- `.github/workflows/ci.yml` (신규)
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` (신규)
- `app/global-error.tsx` (신규)
- `next.config.ts` (수정 — Sentry 플러그인 연동)
- `app/layout.tsx` (수정 — GA 컴포넌트 조건부 추가)
- `docs/deployment.md` (신규)

## 다음 세션에서 사용자가 할 일 (콘솔 작업)

1. Vercel 대시보드에서 GitHub 저장소 Import → 환경변수(Supabase 키 3종 + 선택적으로 Sentry/GA) 등록 → 배포
2. Sentry 프로젝트 생성 후 발급된 DSN을 Vercel 환경변수에 등록
3. Google Analytics 속성 생성 후 측정 ID를 Vercel 환경변수에 등록
4. 커스텀 도메인 연결(선택)
5. 배포 후 실제 URL로 Task 014에서 미룬 Lighthouse 측정 수행
