# Gather 개발 로드맵

일회성 이벤트를 간편하게 관리하는 올인원 플랫폼 - 초대 링크 하나로 모든 것을 해결

## 개요

Gather는 5-30명 규모의 소규모 이벤트 주최자와 참여자를 위한 모바일 퍼스트 플랫폼으로 다음 기능을 제공합니다:

- **간편한 이벤트 생성**: 제목, 날짜, 장소만 입력하면 즉시 이벤트 생성
- **원클릭 초대 시스템**: 자동 생성된 초대 링크를 카카오톡으로 간편 공유
- **실시간 참여자 관리**: Supabase Realtime으로 참여자 목록 자동 업데이트
- **관리자 대시보드**: 플랫폼 전체 현황을 한눈에 파악하는 통계 시스템

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 - 우선순위

- **Task 001: 프로젝트 구조 및 라우팅 설정** - ✅ 완료 (2026-08-18)
  - ✅ Next.js App Router 기반 전체 라우트 구조 생성
  - ✅ 모든 주요 페이지의 빈 껍데기 파일 생성 (13개 페이지)
  - ✅ 공통 레이아웃 컴포넌트 골격 구현 (모바일/데스크톱)
  - ✅ 모바일 하단 내비게이션 바 구조 설정 (`components/bottom-nav.tsx`)
  - ✅ 관리자 사이드바 레이아웃 구조 설정 (`components/admin-sidebar.tsx`)
  - ⚠️ **후속 조치 필요 (Task 008에서 처리)**: `proxy.ts`의 인증 리다이렉트 예외 목록(`/`, `/login`, `/auth/*`)이 `/join/[invite_code]`와 `/admin/login`을 포함하지 않아, 비로그인 사용자가 초대 미리보기 및 관리자 로그인 페이지 자체에 접근할 수 없는 상태. PRD 요구사항과 충돌하므로 인증 시스템 구현 시 예외 경로 추가 필요.

- **Task 002: 타입 정의 및 인터페이스 설계** - ✅ 완료 (2026-08-20)
  - ✅ TypeScript 인터페이스 및 타입 정의 파일 생성 (`lib/types/domain.ts`)
  - ✅ 프론트엔드 컴포넌트 Props 타입 정의 (`lib/types/ui.ts` — 공유 상태 타입, 컴포넌트별 Props는 Task 003 이후 개별 정의)
  - ✅ API 응답 타입 정의 (`lib/types/api.ts`)
  - ✅ 전역 상태 관리 타입 정의 (`lib/types/ui.ts`의 필터·페이지네이션·정렬 타입)
  - ✅ UI 컴포넌트용 임시 데이터 모델 타입 정의 (`lib/types/domain.ts` — Task 007에서 `lib/supabase/types.ts` 기반으로 교체 예정)
  - ✅ 폼 입력값 타입 정의 (`lib/types/forms.ts` — Task 004에서 Zod 스키마 연동 예정)

### Phase 2: UI/UX 완성 (더미 데이터 활용)

- **Task 003: 공통 컴포넌트 라이브러리 구현** - ✅ 완료 (2026-08-20)
  - ✅ shadcn/ui 추가 컴포넌트 설치 (Avatar, Dialog, Form, Select, Skeleton, Sonner — Card는 Task 001에서 기설치)
  - ✅ 이벤트 카드 컴포넌트 구현 (`components/event-card.tsx`)
  - ✅ 참여자 프로필 카드 컴포넌트 구현 (`components/participant-card.tsx`)
  - ✅ 로딩 스켈레톤 컴포넌트 구현 (`components/loading-skeletons.tsx`)
  - ✅ 빈 상태 UI 컴포넌트 구현 (`components/empty-state.tsx`)
  - ⚠️ **후속 조치**: 더미 데이터 생성 유틸리티는 컴포넌트 시각 검증용으로 임시 작성 후 삭제함 — Task 004에서 페이지 UI 구현 시 `lib/mock/`에 정식으로 재작성 필요
  - ⚠️ **후속 조치**: `next.config.ts`에 `images.remotePatterns` 미설정 — Task 007에서 Supabase Storage(`event-covers`) 도메인 확정 시 `next/image` 사용을 위해 추가 필요
  - ℹ️ 브라우저 시각 검증은 `proxy.ts` 인증 리다이렉트로 인해 생략, `typecheck`/`lint`로만 검증함

- **Task 004: 주최자 모바일 UI/UX 완성** ✅ - 완료 (2026-08-21)
  - ✅ 홈 페이지 (랜딩) UI 구현 (F001)
  - ✅ 내 이벤트 목록 페이지 UI - 주최자 뷰 (F007, F008)
  - ✅ 이벤트 생성 페이지 폼 UI 구현 (F001, F009)
    - ✅ React Hook Form 및 Zod 설치
    - ✅ 폼 유효성 검사 구현
  - ✅ 이벤트 상세 페이지 UI - 주최자 뷰 (F002, F003, F005)
    - ✅ 참여자 목록 관리 UI
    - ✅ 초대 링크 공유 버튼
    - ✅ 이벤트 수정/삭제 권한 UI
  - ✅ 이벤트 수정 페이지 UI 구현 (F006, F009)
  - ✅ 주최자 프로필 페이지 UI 구현 (F011)
  - ✅ 주최자 전용 네비게이션 바 및 액션 버튼
    - ✅ "+ 이벤트 만들기" 액션 - `bottom-nav.tsx` 탭 아이콘으로 구현 (별도 FAB 미구현)
  - ✅ 반응형 디자인 및 다크 모드 적용 - 시맨틱 색상 변수·`dark:` 클래스로 코드상 충족, 시각적 검증은 미실시
  - **주요 차이점**: 이벤트 생성, 수정, 삭제 권한 보유

- **Task 005: 참여자 모바일 UI/UX 완성** ✅ - 완료 (2026-08-21)
  - ✅ 초대 링크 참여 페이지 UI 구현 (F004)
    - ✅ 이벤트 정보 미리보기
    - ✅ 참여 확인 버튼
  - ✅ 내가 참여한 이벤트 목록 페이지 UI - 참여자 뷰 (F007) — `/events` 페이지 내 "내가 참여한 이벤트" 탭으로 통합 구현
  - ✅ 이벤트 상세 페이지 UI - 참여자 뷰 (F005)
    - ✅ 읽기 전용 이벤트 정보
    - ✅ 다른 참여자 목록 보기 (수정 불가)
    - ✅ 공유 기능 제한 — `isHost`일 때만 초대 공유 버튼 노출
  - ✅ 참여자 프로필 페이지 UI 구현 (F011) — Task 004의 `ProfileForm`이 role 무관하게 재사용됨
  - ✅ 참여자 전용 네비게이션 바 (생성 버튼 없음) — `bottom-nav.tsx` 자체 분기 대신 `/events` 페이지의 역할 탭에서 FAB 노출 여부로 처리
  - ✅ 반응형 디자인 및 다크 모드 적용 — 모바일 뷰포트(390px) 및 다크모드로 브라우저 시각 검증 완료
  - ⚠️ **후속 조치 (기존 이슈, Task 004 범위)**: `events/[id]`, `events/[id]/edit` 페이지와 `(main)/layout.tsx`가 Cache Components 하에서 "Blocking Route" 경고를 발생시키던 문제를 Task 005 검증 중 발견해 Suspense 경계 추가로 해소함
  - ⚠️ **후속 조치 (기존 데이터 버그)**: 목업 참여자의 `role`이 배열 인덱스 0번째로 고정 배정되어 실제 주최자(`created_by`)와 불일치하던 버그를 발견해 수정함
  - **주요 차이점**: 읽기 전용 뷰, 초대 링크로만 참여 가능
  - **의존성**: Task 004 (공통 컴포넌트 재사용)

- **Task 006: 관리자 데스크톱 페이지 UI 완성** ✅ - 완료 (2026-08-21)
  - ✅ 관리자 로그인 페이지 UI 구현 — Google 로그인 버튼 UI만 구현, 실제 OAuth 연동은 Task 008에서 처리
  - ✅ 관리자 대시보드 메인 페이지 UI 구현 (F012) — 지표 카드 7종 + 빠른 링크
  - ✅ 이벤트 관리 테이블 페이지 UI 구현 (F013) — 검색, 상태 필터, 삭제 확인 다이얼로그
  - ✅ 사용자 관리 테이블 페이지 UI 구현 (F014) — 검색, 역할 필터, 자신은 삭제 불가 처리
  - ✅ 통계 분석 페이지 UI 구현 (F015) — Recharts 라인 차트 2종(이벤트/사용자 추이), 기간 드롭다운은 UI만 구현(목업이 7일치뿐이라 실제 재조회는 Task 011에서 연동)
  - ✅ Recharts 라이브러리 설치 및 더미 차트 구현
  - ⚠️ **발견 사항**: Task 001에서 이미 `app/(admin-dashboard)/admin/*` 골격이 존재했음(별도로 `app/admin/(dashboard)/`를 새로 만들려다 라우트 경로 충돌 빌드 에러로 발견, 기존 골격에 구현 이식)
  - ⚠️ **후속 조치**: `proxy.ts`에 `/admin/login`을 인증 예외로 추가 (Task 001 후속 조치 메모 반영, `/admin/dashboard` 등 나머지 경로는 계속 보호됨)
  - ⚠️ **후속 조치**: 목업 사용자에 `role: admin` 1명 추가 — 사용자 관리 페이지의 역할 필터 검증 및 "자신은 삭제 불가" UI 확인용

### Phase 3: 데이터베이스 설정 및 핵심 기능 구현 ✅

- **Task 007: 데이터베이스 스키마 및 Supabase 초기 설정** ✅ - 완료 (2026-08-21)
  - ✅ UI 검토 후 최종 확정된 요구사항을 반영한 스키마 설계
  - ✅ Supabase 데이터베이스 테이블 생성 (events, event_participants 신규 생성 / users는 기존 `profiles` 테이블을 확장해 재사용 — `full_name`→`name` 컬럼명 변경, `role` 컬럼 추가)
  - ✅ Row Level Security (RLS) 정책 설정 — events/event_participants는 전체 조회 허용 + 본인만 쓰기, profiles는 `role` 컬럼을 자기 자신도 UPDATE로 변경 불가하도록 강화
  - ✅ 인덱스 생성 (invite_code, created_by, event_id, user_id)
  - ✅ Supabase Storage 버킷 생성 (event-covers) — 공개 조회 + 인증 사용자 업로드 + 본인 파일만 수정/삭제 정책
  - ⚠️ Realtime 구독 설정 준비 — 미착수, Task 010(참여자 관리, 실시간 카운트) 진행 시 함께 설정 예정
  - ⚠️ UI에서 사용 중인 임시 타입을 실제 DB 스키마 타입으로 교체 — 미착수. `lib/supabase/types.ts`는 실제 DB 기반으로 재생성 완료했으나, `lib/types/domain.ts`(UI가 참조하는 타입)는 실제 API 연동이 시작되는 Task 009/010에서 함께 교체하기로 결정 (지금 교체 시 Task 004~006 전체 컴포넌트의 타입 사용을 건드리는 범위 큰 변경이라 보류)
  - ⚠️ **후속 조치**: `instruments` 테이블(스타터킷 튜토리얼 잔재)은 Gather와 무관하여 그대로 둠, 필요 시 이후 삭제
  - ⚠️ **후속 조치**: `next.config.ts`에 `event-covers` 버킷 도메인 `images.remotePatterns` 추가 완료 (Task 003 후속 조치 반영)

- **Task 008: 인증 시스템 및 권한 관리** ✅ - 완료 (2026-08-21)
  - ✅ Google OAuth 로그인 플로우 완성 (F010) — `GoogleLoginButton`에 `next` prop 추가로 일반/관리자 로그인 목적지 분리
  - ✅ 사용자 프로필 자동 생성 로직 구현 — Task 007의 `handle_new_user` 트리거로 이미 구현되어 있음을 확인
  - ✅ 관리자 권한 체크 (role: admin) — Edge 미들웨어 대신 `(admin-dashboard)/layout.tsx`(Server Component)에서 `profiles.role` 조회로 체크. `proxy.ts`(Edge)는 JWT claims만 다루고 `profiles.role`을 포함하지 않아 이 계층에서 처리하는 게 더 안전하다고 판단
  - ✅ 보호된 라우트 접근 제어 구현 — `proxy.ts`(미인증) + 레이아웃(role 불일치) 2단계 방어
  - ✅ 로그아웃 기능 구현 — 기존 `LogoutButton`에 `redirectTo` prop 추가해 관리자 사이드바에서 재사용
  - ✅ Playwright MCP를 활용한 인증 플로우 E2E 테스트 — `docs/testing/task-008-auth-flow-test.md`에 기록. Google OAuth 완주는 외부 서비스라 자동화 범위 밖, 리다이렉트/권한 분기 로직만 검증
  - ⚠️ **미검증 항목**: `role: admin` 계정으로 관리자 페이지 정상 진입하는 성공 경로는 실제 관리자 계정 부재로 미검증 (role 불일치 거부 경로는 실계정으로 검증 완료)

- **Task 009: 이벤트 CRUD 및 초대 시스템** ✅ - 완료 (2026-08-21)
  - ✅ 이벤트 생성 API 구현 (F001) — `lib/actions/events.ts`의 `createEvent`
  - ✅ 초대 코드 자동 생성 로직 구현 (F002) — `lib/invite-code.ts`, URL-safe 8자리(혼동 문자 제외)
  - ✅ 이벤트 수정/삭제 API 구현 (F006) — `updateEvent`/`deleteEvent`, RLS와 별개로 `created_by` 소유권 이중 체크
  - ✅ 커버 이미지 업로드 기능 구현 (F009) — `event-covers` 버킷 업로드 연동
  - ✅ 초대 링크 공유 기능 구현 (F003) — 기존 클립보드 복사 + `navigator.share`(모바일에서 카카오톡 포함 공유 시트) 그대로 유지, 카카오 SDK 전용 연동은 외부 앱키 발급이 필요해 범위 밖으로 결정
  - ✅ 이벤트 상태 자동 관리 로직 구현 (F008) — `lib/event-status.ts`, DB에 저장하지 않고 조회 시점마다 `event_date` 기준 파생 계산 (당일=진행중 규칙)
  - ⚠️ **범위 확장**: 원래 CRUD 쓰기만 계획했으나, 실제 이벤트를 만들면 목업 목록/상세에는 반영되지 않아 기능이 어색해지는 문제로 조회(`lib/queries/events.ts`)까지 함께 실제 DB로 전환. `events/page.tsx`, `events/[id]`, `join/[invite_code]` 모두 실 데이터 연동
  - ⚠️ **범위 확장**: `lib/types/domain.ts`를 Task 007 DB 스키마 기반으로 교체(Task 007에서 보류했던 항목). `User.name`이 nullable로 바뀌며 `participant-card.tsx`, `profile-form.tsx`에 null-safe 처리 추가
  - ⚠️ **범위 확장**: `profile/page.tsx`의 목업 `currentMockUser`를 실제 세션 사용자 조회(`lib/queries/profile.ts`)로 전환, `ProfileForm`의 `TODO(Task 008)`로 잘못 남아있던 프로필 수정 API도 함께 연동
  - ✅ Playwright MCP를 활용한 이벤트 생성/수정/삭제 테스트 — 브라우저(Chrome 확장 세션)로 생성→조회→수정→초대링크→삭제 전체 사이클을 실계정으로 직접 검증. `datetime-local` 인풋은 Chrome 자동화의 `type` 액션이 세그먼트 입력을 지원하지 않아 JS로 값을 직접 설정해 우회
  - ⚠️ **미착수**: `event_participants` 쓰기(실제 참여 로직)는 Task 010 범위로 명확히 분리, 조회만 이번에 연동함

- **Task 010: 참여자 관리** ✅ - 완료 (2026-08-21) — 상세 명세서: `docs/tasks/task-010-participants.md`
  - ✅ 초대 링크 참여 로직 구현 (F004) — `lib/actions/participants.ts`의 `joinEvent`
  - ✅ 중복 참여 방지 로직 구현 — `UNIQUE(event_id, user_id)` DB 제약 + `23505` 에러를 성공으로 취급하는 애플리케이션 처리
  - ✅ 실시간 참여자 수 카운트 업데이트 — `components/participants-section.tsx`, Realtime `postgres_changes` 구독
  - ✅ 내가 참여한/만든 이벤트 목록 조회 구현 (F007) — Task 009에서 이미 구현됨, 회귀 테스트로 재확인
  - ✅ Claude in Chrome을 활용한 실시간 참여자 업데이트 테스트 — 이벤트 생성/참여/중복참여/404/실시간 INSERT·DELETE 전체 시나리오 검증
  - ⚠️ **범위 확장**: `createEvent`가 host를 `event_participants`에 자동 참여시키지 않던 기존 버그 발견 및 수정 (host 자신이 참여자 수에 포함되지 않던 문제)
  - ⚠️ **발견한 결함(수정 완료)**: `event_participants`의 `REPLICA IDENTITY`가 기본값(PK만 포함)이라 Realtime DELETE 이벤트가 `event_id` 기준 서버 필터를 통과하지 못해 드롭되던 문제 — `REPLICA IDENTITY FULL`로 전환해 해결
  - ⚠️ **미검증 항목**: 실제 2번째 Google 계정으로의 참여 클릭 플로우와 비로그인 OAuth 리다이렉트는 테스트 계정 제약으로 DB 직접 조작으로 대체 검증함

- **Task 011: 관리자 대시보드 백엔드 구현** ✅ - 완료 (2026-08-21) — 상세 명세서: `docs/tasks/task-011-admin-backend.md`
  - ✅ 대시보드 지표 집계 쿼리 구현 (F012) — `lib/queries/admin.ts`의 `getDashboardMetrics`
  - ✅ 이벤트 관리 테이블 삭제 API 구현 (F013) — `deleteEventAsAdmin`, 검색/필터는 Task 006에서 이미 클라이언트 사이드로 구현되어 있어 서버는 전체 목록만 제공
  - ✅ 사용자 관리 테이블 삭제 API 구현 (F014) — `deleteUserAsAdmin`, `auth.admin.deleteUser()`로 `auth.users`/`profiles`/`event_participants` 연쇄 삭제
  - ✅ 통계 데이터 집계 및 그래프 데이터 API 구현 (F015) — `getAnalyticsSummary(period)`, 기간(7/30/90일) 변경 시 `fetchAnalyticsSummary` 액션으로 실시간 재조회
  - ⚠️ **페이지네이션/정렬 로직**: 이번 범위에서 제외 — 기존 UI가 클라이언트 사이드 검색/필터를 이미 완비했고 초기 데이터 규모상 전체 목록 조회로 충분하다고 판단, 데이터 증가 시 후속 Task로 분리
  - ✅ Claude in Chrome을 활용한 관리자 기능 통합 테스트 — admin 계정 부재로 기존 계정을 SQL로 임시 승격해 대시보드/이벤트 삭제/사용자 목록/통계 기간 재조회/원복 후 접근 거부 회귀까지 검증
  - ⚠️ **핵심 아키텍처 결정**: 이메일은 `auth.users`에만 있고 `public.profiles`에는 없어, `service_role` 키를 쓰는 서버 전용 Admin 클라이언트(`lib/supabase/admin.ts`)를 신규 도입. `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 추가(사용자가 Supabase 대시보드에서 직접 발급). RLS를 우회하는 클라이언트이므로 모든 관리자 액션 진입점에서 `requireAdmin()`으로 재검증
  - ⚠️ **범위 확장(빌드 차단 결함 수정)**: `npm run build` 중 관리자 라우트 4개 전체가 prerender 단계에서 실패하는 것을 발견. 원인은 `app/(admin-dashboard)/layout.tsx`(Task 008 작성분, 이번 세션 변경 아님)가 `cookies()`를 `<Suspense>` 밖에서 호출하던 기존 결함 — 레이아웃의 인증 체크를 `RequireAdmin` 서브컴포넌트로 분리해 `<Suspense>`로 감싸 해결. 이 수정 없이는 Task 011 범위와 무관하게 프로덕션 빌드 자체가 불가능한 상태였음
  - ⚠️ **정리**: 더 이상 참조되지 않는 `lib/mock/admin.ts`, `lib/mock/events.ts` 삭제
  - ⚠️ **미검증 항목**: 실제 사용자 삭제(`auth.admin.deleteUser`) 실행은 DB의 유일한 후보 계정이 실사용자 이메일로 가입된 계정이라 데이터 보존을 위해 보류, 코드 리뷰로 로직만 검증함

- **Task 012: 핵심 기능 통합 테스트** ✅ - 완료 (2026-08-21) — 상세 명세서: `docs/tasks/task-012-integration-testing.md`
  - ✅ Claude in Chrome을 사용한 전체 사용자 플로우 테스트 — Task 009~011에서 검증되지 않은 "플로우 간 전환" 관점에서 재검증
  - ✅ 주최자 플로우: 이벤트 생성 → 호스트 자동 참여 확인 → 초대 링크 복사 → 수정 → 목록 반영까지 한 세션에서 끊김 없이 확인
  - ✅ 참여자 플로우: SQL 보간으로 "이미 참여 중" 상태 재현 → 초대 미리보기 반영 확인 → 중복 참여 재클릭 시 에러 없음(Task 010 회귀 확인). 실제 2번째 Google 계정으로의 완전 자동 로그인은 이전 Task들과 동일한 이유로 범위 밖
  - ✅ 관리자 플로우: SQL 임시 승격 → 대시보드→이벤트→사용자→통계 사이드바 네비게이션 전체를 콘솔 에러 없이 확인, 통계 기간 재조회 확인, 원복 후 접근 거부 회귀 확인
  - ✅ 에러 핸들링 및 엣지 케이스 테스트 — 존재하지 않는 이벤트 ID/초대 코드 404 확인
  - 🐛 **발견 및 수정한 결함**: 개별 Task 테스트에서 다루지 않았던 "권한 없는 사용자의 남의 이벤트 수정 페이지 직접 접근" 시나리오에서 두 가지 결함 발견 — ① `/events/[id]/edit`에 UI 소유권 가드가 없어 폼이 그대로 노출되던 문제(서버 액션은 안전했으나 UI가 노출) ② 그 결과 PostgREST 원시 에러 메시지가 사용자에게 그대로 노출되던 문제(`createEvent`/`updateEvent`/`deleteEvent`/`updateProfile` 네 액션 공통 패턴). 즉시 수정하고 재검증까지 완료

### Phase 4: 고급 기능 및 최적화

- **Task 013: 사용자 경험 향상** ✅ - 완료 (2026-08-21) — 상세 명세서: `docs/tasks/task-013-ux-improvements.md`
  - ✅ Toast 알림 시스템 구현 — Task 003에서 Sonner 설치, 10개 파일에서 이미 사용 중이었음을 확인, 추가 작업 없음
  - ✅ 로딩 상태 및 스켈레톤 UI 적용 — `/events`, `/events/[id]`, `/join/[invite_code]`, `/admin/events`, `/admin/users`에 스켈레톤 연결, 인위적 지연 재현으로 실제 렌더링 확인
  - ✅ 에러 바운더리 및 404 페이지 구현 — `app/not-found.tsx`, `app/error.tsx` 신규 생성, `EmptyState` 컴포넌트 재사용
  - ✅ 폼 유효성 검사 메시지 개선 — `lib/schemas/event.ts`/`profile.ts`에 필드별 한국어 메시지가 Task 004에서 이미 구현되어 있음을 확인, 추가 작업 없음
  - ✅ 터치 영역 최적화 — `Button`(36→44/48px), `Input`(36→44px) 기본 컴포넌트 높이 조정. `bottom-nav.tsx`는 이미 64px로 충분해 수정 불필요
  - ⚠️ **범위 제외**: 무한 스크롤/가상화 리스트는 PRD의 5-30명 소규모 이벤트 타겟과 Task 011의 서버 페이지네이션 제외 결정을 근거로 이번 Task에서 구현하지 않기로 결정. 실사용 규모가 커지면 후속 Task로 재검토
  - 🐛 **계획 수정(구현 중 발견)**: 원래 계획한 라우트 세그먼트 `loading.tsx` 5개는 각 페이지가 이미 내부 `<Suspense>`(fallback 없음)로 데이터를 감싸고 있어 전혀 트리거되지 않는 구조적 문제를 인위적 지연 테스트로 발견. `loading.tsx` 파일들을 삭제하고 각 페이지의 내부 Suspense에 `fallback`을 직접 연결하는 방식으로 전환해 실제 동작을 확인
  - 🐛 **버전 차이 발견**: `app/error.tsx` 작성 중 Next.js 16(설치 버전)의 에러 바운더리 콜백 prop이 이전 버전의 `reset`에서 `retry`로 이름이 바뀐 것을 `node_modules/next/dist/docs/`에서 확인 후 반영 (AGENTS.md 지침에 따른 검증)
  - ✅ Claude in Chrome을 활용한 시각 회귀 테스트 — 404/스켈레톤/터치 영역 확대가 라이트·다크 모드 및 관리자 페이지 전반에서 레이아웃을 깨뜨리지 않음을 확인

- **Task 014: 성능 최적화 및 SEO**
  - 이미지 최적화 (next/image, webp 포맷)
  - 코드 스플리팅 최적화
  - Supabase 쿼리 최적화 (select 최소화, JOIN 최적화)
  - 메타 태그 및 Open Graph 설정
  - robots.txt 및 sitemap.xml 생성
  - Lighthouse 점수 90+ 달성

- **Task 015: 배포 및 모니터링**
  - Vercel 프로젝트 설정 및 환경 변수 구성
  - CI/CD 파이프라인 구축
  - 에러 모니터링 시스템 설정 (Sentry)
  - 분석 도구 설정 (Google Analytics)
  - 프로덕션 배포 및 도메인 연결
  - 배포 후 통합 테스트 수행

## 작업별 세부 사항

### 각 Task 파일 구조

```markdown
# Task XXX: [작업명]

## 개요

- **목표**: [작업의 핵심 목표]
- **예상 소요 시간**: [X일]
- **관련 기능**: [F001, F002 등]
- **의존성**: [이전에 완료되어야 할 Task]

## 구현 사항

- [ ] 세부 구현 항목 1
- [ ] 세부 구현 항목 2
- [ ] 세부 구현 항목 3

## 수락 기준

- 기준 1: [측정 가능한 완료 조건]
- 기준 2: [측정 가능한 완료 조건]

## 테스트 체크리스트 (API/비즈니스 로직 작업 시)

- [ ] Playwright MCP 테스트 시나리오 1
- [ ] Playwright MCP 테스트 시나리오 2
- [ ] 에러 케이스 테스트

## 관련 파일

- /app/[경로]/page.tsx
- /components/[컴포넌트].tsx
- /lib/[유틸리티].ts
```

## 기술 스택 체크리스트

### 이미 설치됨 ✅

- [x] Next.js 15 (App Router)
- [x] TypeScript 5.6+
- [x] React 19
- [x] Tailwind CSS v4
- [x] shadcn/ui (new-york 스타일)
- [x] Lucide React
- [x] next-themes
- [x] Supabase (@supabase/ssr, @supabase/supabase-js)
- [x] ESLint, Prettier, Husky

### 추가 필요

- [ ] React Hook Form 7.x (Task 004에서 설치)
- [ ] Zod (Task 004에서 설치)
- [ ] Recharts 2.x (Task 006에서 설치)

## 품질 체크리스트

### Phase 완료 기준

#### Phase 1 (애플리케이션 골격)

- [ ] 모든 13개 페이지의 라우트 파일 생성
- [ ] 모바일/데스크톱 레이아웃 분리 완성
- [ ] 프론트엔드 타입 정의 파일 구조 완성
- [ ] 임시 데이터 모델 타입 정의 완료

#### Phase 2 (UI/UX 완성)

- [ ] 모든 페이지 UI가 더미 데이터로 완성
- [ ] 주최자와 참여자의 서로 다른 UX 플로우 동작 확인
- [ ] 권한에 따른 UI 조건부 렌더링 확인
- [ ] 반응형 디자인 적용 완료
- [ ] 다크 모드 지원 완료
- [ ] 사용자 플로우 네비게이션 동작

#### Phase 3 (데이터베이스 설정 및 핵심 기능)

- [ ] 데이터베이스 스키마 생성 및 RLS 설정
- [ ] 모든 API 엔드포인트 구현 완료
- [ ] 실시간 기능 정상 동작
- [ ] 인증 및 권한 시스템 동작
- [ ] Playwright MCP 테스트 모두 통과

#### Phase 4 (최적화)

- [ ] Lighthouse 점수 90+ 달성
- [ ] 모든 이미지 최적화 완료
- [ ] 프로덕션 배포 성공
- [ ] 에러 모니터링 설정 완료

## 주의사항

### 구조 우선 접근법 준수

1. **Phase 1을 완벽히 완료 후 Phase 2 시작**: 골격이 완성되지 않으면 UI 작업 시작 금지
2. **더미 데이터로 전체 UI 완성 후 데이터베이스 설계**: UI가 완성되어 요구사항이 확정된 후 최적화된 스키마 설계
3. **공통 컴포넌트 우선 개발**: 페이지별 컴포넌트보다 공통 컴포넌트 먼저 완성
4. **UI 피드백 반영 후 백엔드 구현**: UI 검토를 통해 도출된 개선사항을 데이터베이스 설계에 반영

### 테스트 필수 사항

1. **모든 API 연동은 Playwright MCP로 테스트**: 수동 테스트 의존 금지
2. **각 Phase 완료 시 통합 테스트 수행**: Phase 간 전환 시 회귀 테스트 필수
3. **에러 케이스 반드시 테스트**: Happy path만 테스트하지 말고 에러 상황도 검증

### 성능 목표

1. **모바일 First Contentful Paint**: 1.5초 이하
2. **Time to Interactive**: 3초 이하
3. **이미지 로딩**: Lazy loading 필수 적용
4. **번들 크기**: 각 페이지 200KB 이하

## 다음 단계

1. **즉시 시작**: Task 001 (프로젝트 구조 및 라우팅 설정)
2. **구현 시작**: 라우트 파일 및 레이아웃 골격 구축
3. **UI 우선 개발**: Phase 2에서 더미 데이터로 전체 UI를 완성한 후 데이터베이스 설계 진행

---

**📌 이 로드맵은 6주 내 MVP 완성을 목표로 하며, 각 Task는 1-2일 내 완료 가능한 단위로 구성되었습니다.**
**구조 우선 접근법을 엄격히 준수하여 중복 작업을 최소화하고 팀 협업 효율을 극대화합니다.**
