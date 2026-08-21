# Task 014: 성능 최적화 및 SEO

## 개요

- **목표**: 이미지/쿼리/번들 최적화를 적용하고, 배포 전 준비 단계에서 가능한 SEO 기반(메타데이터/OG/sitemap)을 갖춘다
- **예상 소요 시간**: 반나절
- **관련 기능**: 전체 성능/SEO 품질 (특정 F 없음)
- **의존성**: Phase 3 전체 완료. 실제 배포 도메인이 필요한 항목(Lighthouse 측정)은 Task 015(배포) 이후로 미룸

## 배경 / 현재 상태

- **이미지 최적화**: `<img>` 태그 사용처가 코드베이스에 전혀 없고, 4개 컴포넌트(`event-card.tsx`, `event-form.tsx`, `join-event-card.tsx`, `app/(main)/events/[id]/page.tsx`)가 모두 이미 `next/image`를 쓰고 있음 — 추가 작업 불필요, 완료 표시만
- **코드 스플리팅**: `components/admin-analytics-charts.tsx`가 Recharts(무거운 차트 라이브러리)를 일반 import로 사용 중. `/admin/analytics`는 별도 라우트 세그먼트라 Next.js App Router가 라우트 단위로는 이미 자동 스플리팅하지만, `next/dynamic`으로 명시적 지연 로딩을 추가하면 초기 관리자 대시보드 진입(`/admin/dashboard`) 시 차트 라이브러리를 아예 받지 않게 할 수 있는지 확인 필요
- **Supabase 쿼리 최적화**: `lib/queries/admin.ts`(Task 011)는 이미 필요한 컬럼만 선택하도록 잘 작성되어 있음. `lib/queries/events.ts`(Task 009)와 `lib/queries/profile.ts`는 `select("*")` 또는 넓은 조인을 쓰고 있어 실제 사용하는 필드만 선택하도록 좁힐 여지가 있음
- **메타 태그 및 OG**: 루트 `app/layout.tsx`의 `metadata`(title/description)와 `lang="en"`이 스타터킷 원본 그대로임을 발견. `app/opengraph-image.png`/`twitter-image.png`도 8/13 초기 커밋 시점 스타터킷 이미지. Gather 서비스에 맞게 전면 수정하기로 결정(사용자 확인 완료). 개별 페이지(이벤트 상세 등)에는 metadata가 전혀 없음 — 이번 Task에서는 루트 레벨과 주요 공개 페이지(이벤트 상세, 초대 미리보기) 위주로 추가
- **robots.txt/sitemap.xml**: 배포 도메인이 아직 없는 로컬 개발 단계(Task 015 미착수)이므로, 코드는 환경변수 기반 URL로 미리 작성해두고 실제 동작 검증은 배포 후로 미루기로 결정(사용자 확인 완료)
- **Lighthouse 90+ 달성**: 로컬 `next dev`/`next build && next start` 환경에서도 측정 자체는 가능하나, 실사용 환경(HTTPS, CDN, 실제 네트워크 조건)과 차이가 커 목표 달성 여부 판단은 배포 후로 미룸. 이번 Task에서는 측정 대신 번들/이미지/쿼리 등 정적으로 확인 가능한 최적화만 적용

## 구현 사항

- [x] `app/layout.tsx`의 `metadata`(title, description)를 Gather 서비스 내용으로 교체, `lang="en"` → `lang="ko"`로 변경
- [x] `app/opengraph-image.tsx`, `app/twitter-image.tsx`(Next.js `ImageResponse` 기반 동적 생성)로 기존 정적 PNG 교체 — 별도 디자인 에셋 없이 텍스트/색상 기반 OG 이미지 생성(사용자 확인: 별도 로고/배너 없음). 한글 텍스트는 Satori 기본 폰트 미지원으로 크래시가 나 영문 태그라인으로 교체(사용자 확인 완료)
- [x] `app/(main)/events/[id]/page.tsx`, `app/join/[invite_code]/page.tsx`에 `generateMetadata`로 이벤트 제목 기반 동적 메타데이터 추가 (공개적으로 공유되는 페이지이므로 OG 미리보기가 실질적 가치가 있음)
- [x] `app/robots.ts` 신규 생성 — `getSiteUrl()`(VERCEL_URL 기반 폴백) 기준, 관리자/인증/프로필/이벤트 생성·수정 경로는 `disallow`
- [x] `app/sitemap.ts` 신규 생성 — 정적 공개 페이지만 포함 (홈, 로그인 등). 이벤트 상세는 사용자별 비공개 성격이 강해 제외
- [x] `components/admin-analytics-charts.tsx`를 `next/dynamic`으로 지연 로딩하도록 `admin/analytics/page.tsx`에서 import 방식 변경, 실제 번들 분석으로 효과 확인 — Client Component 래퍼(`admin-analytics-charts-loader.tsx`)로 분리해 Recharts 청크(372KB) 분리 확인
- [x] `lib/queries/events.ts`의 `select("*, event_participants(*, profiles(*)))` 계열을 실제 사용하는 컬럼으로 좁히기 (UI에서 쓰지 않는 컬럼 제외) — `EVENT_WITH_PARTICIPANTS_SELECT` 상수 도입, `getJoinedEvents`도 1단계 id 조회로 축소
- [x] `lib/queries/profile.ts`의 `select("*")`를 실제 사용 컬럼으로 좁히기

## 수락 기준

- 홈페이지와 이벤트 상세/초대 페이지를 카카오톡 등에 공유했을 때 "Next.js and Supabase Starter Kit"이 아닌 Gather 관련 제목/설명이 보인다 (실제 크롤러 테스트는 배포 후 가능, 이번엔 `generateMetadata` 반환값과 `next build` 결과로 검증) — ✅ 브라우저로 탭 타이틀 확인(`12423 | Gather`, `정석님의 초대: 12423 | Gather`)
- `robots.txt`, `sitemap.xml`이 로컬에서 정상적으로 생성되고 접근 가능하다 — ✅ curl로 200 확인
- 쿼리 최적화 후에도 기존 UI 렌더링에 회귀가 없다 (Task 012 스타일 회귀 확인) — ✅ 브라우저 검증 완료
- `next build` 결과에서 `/admin/analytics` 관련 청크가 다른 관리자 라우트와 분리되어 있는지 확인한다 — ✅ 빌드 매니페스트로 확인
- typecheck/lint/build 모두 통과한다 — ✅ typecheck/build 통과. lint는 이번 세션에서 건드리지 않은 `components/theme-switcher.tsx`(스타터킷 원본)의 `react-hooks/set-state-in-effect` 규칙 위반 1건이 있으나 Task 014 범위 밖 기존 이슈로 별도 처리 필요

## 테스트 체크리스트 (Claude in Chrome)

- [x] `/robots.txt`, `/sitemap.xml` 로컬 접근 확인
- [x] 이벤트 상세 페이지의 `<head>`에서 `og:title`/`og:description`이 실제 이벤트 제목을 반영하는지 페이지 소스로 확인
- [x] 쿼리 컬럼을 좁힌 후 `/events`, `/events/[id]`, `/profile` 페이지가 기존과 동일하게 렌더링되는지 회귀 확인 (참여자 카드, 아바타, 이름 등 필드 누락 없는지)
- [x] `npm run build` 결과에서 `/admin/analytics`의 First Load JS 크기가 `dynamic import` 적용 전후로 달라지는지 비교

## 관련 파일

- `app/layout.tsx` (수정)
- `app/opengraph-image.tsx` (신규, 기존 `.png` 대체)
- `app/twitter-image.tsx` (신규, 기존 `.png` 대체)
- `app/(main)/events/[id]/page.tsx` (수정 — generateMetadata 추가)
- `app/join/[invite_code]/page.tsx` (수정 — generateMetadata 추가)
- `app/robots.ts` (신규)
- `app/sitemap.ts` (신규)
- `app/(admin-dashboard)/admin/analytics/page.tsx` (수정 — dynamic import)
- `lib/queries/events.ts` (수정 — select 컬럼 최적화)
- `lib/queries/profile.ts` (수정 — select 컬럼 최적화)
