# 배포 가이드

Gather를 Vercel에 배포하고 에러 모니터링(Sentry), 분석 도구(Google Analytics)를 연결하는 절차입니다. 코드/설정 파일은 Task 015에서 이미 준비되어 있으므로, 이 문서는 각 서비스 콘솔에서 직접 진행해야 하는 단계만 안내합니다.

## 1. Vercel 프로젝트 생성 및 배포

1. [vercel.com](https://vercel.com)에 GitHub 계정으로 로그인
2. "Add New..." → "Project" → 이 저장소(`ohjeongsuk/nextjs-supabase-app`) Import
3. Framework Preset은 Next.js가 자동 감지됨 (`vercel.json`에 명시되어 있어 추가 설정 불필요)
4. "Environment Variables"에 아래 값을 등록 (`.env.local`에 있는 값과 동일하게 입력, `.env.example`이 키 목록 참고용)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (관리자 기능에 필요, 노출되면 안 되는 값이므로 반드시 서버 전용 환경변수로 등록)
5. "Deploy" 클릭 → 빌드 로그에서 정상 완료 확인
6. 배포 완료 후 발급된 `*.vercel.app` 주소로 접속해 로그인/이벤트 생성 등 핵심 플로우 재확인

## 2. GitHub Actions CI 활성화

`.github/workflows/ci.yml`이 이미 저장소에 있어 push/PR 시 자동으로 lint/typecheck/build를 검증합니다. 다만 build 단계가 Supabase 환경변수를 필요로 하므로:

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret"으로 아래 3개 등록 (Vercel과 동일한 값)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. 이후 push하면 Actions 탭에서 워크플로우 실행 결과 확인 가능

## 3. Sentry(에러 모니터링) 연결 — 선택

SDK는 이미 설치·설정되어 있고, `NEXT_PUBLIC_SENTRY_DSN`이 비어있으면 자동으로 비활성화되므로 건너뛰어도 무방합니다. 연결하려면:

1. [sentry.io](https://sentry.io)에서 조직 생성 → 새 프로젝트 생성 (Platform: Next.js)
2. 프로젝트 생성 시 발급되는 DSN을 복사
3. Vercel 프로젝트 환경변수에 `NEXT_PUBLIC_SENTRY_DSN` 추가
4. (선택, 소스맵 업로드로 실제 에러 발생 라인을 정확히 보려면) Sentry에서 조직 슬러그·프로젝트 슬러그·Auth Token(Settings → Auth Tokens, `project:releases` 권한)을 발급해 Vercel 환경변수에 각각 `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`으로 등록
5. 재배포 후 임의로 에러를 발생시켜(예: 존재하지 않는 이벤트 ID 접근) Sentry 대시보드에 이벤트가 수집되는지 확인

## 4. Google Analytics 연결 — 선택

1. [analytics.google.com](https://analytics.google.com)에서 속성 생성 → 웹 데이터 스트림 추가
2. 발급되는 측정 ID(`G-XXXXXXX` 형식) 복사
3. Vercel 프로젝트 환경변수에 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 추가
4. 재배포 후 GA 실시간 보고서에서 방문 이벤트가 수집되는지 확인

## 5. 커스텀 도메인 연결 — 선택

1. Vercel 프로젝트 → Settings → Domains에서 도메인 추가, DNS 안내에 따라 레코드 설정
2. 커스텀 도메인 연결 시 `lib/utils.ts`의 `getSiteUrl()`이 여전히 `VERCEL_URL`(`*.vercel.app`)을 반환하는 문제가 있으므로, `VERCEL_PROJECT_PRODUCTION_URL` 환경변수를 우선 사용하도록 코드 수정 필요 (도메인 확정 후 별도 작업으로 진행 권장)

## 6. 배포 후 성능 측정 (Task 014에서 미룬 항목)

로컬 환경과 실배포 환경(HTTPS, CDN, 실제 네트워크)의 차이가 크므로, Lighthouse 90+ 목표는 실제 배포 URL 기준으로 측정합니다.

1. Chrome DevTools → Lighthouse 탭에서 배포된 URL 측정 (모바일/데스크톱 모두)
2. 목표 미달 항목이 있으면 이슈로 기록 후 후속 작업으로 분리

## 참고: 환경변수 전체 목록

`.env.example` 파일에 필요한 모든 키가 값 없이 정리되어 있습니다. Vercel과 GitHub Secrets 모두 이 파일을 기준으로 등록하면 됩니다.
