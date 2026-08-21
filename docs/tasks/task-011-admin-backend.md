# Task 011: 관리자 대시보드 백엔드 구현

## 개요

- **목표**: Task 006에서 목업으로 완성된 관리자 대시보드 4개 화면(대시보드/이벤트 관리/사용자 관리/통계 분석)을 실제 Supabase 데이터로 전환한다
- **예상 소요 시간**: 1일
- **관련 기능**: F012(대시보드 지표), F013(이벤트 관리 테이블), F014(사용자 관리 테이블), F015(통계 분석)
- **의존성**: Task 007(DB 스키마), Task 008(관리자 권한 체크), Task 006(UI 골격 + 타입)

## 배경 / 현재 상태

- `app/(admin-dashboard)/layout.tsx`가 이미 `profiles.role === 'admin'`을 체크해 하위 페이지 전체를 보호하고 있음 — 페이지 레벨에서 role을 다시 체크할 필요는 없지만, **Server Action은 별도 호출 경로이므로 액션 내부에서 별도로 admin 검증 필요**
- `lib/mock/admin.ts`의 `mockDashboardMetrics`/`mockAdminEvents`/`mockAdminUsers`/`mockAnalyticsSummary`를 실제 쿼리 결과로 교체하는 것이 핵심 작업. 타입(`lib/types/api.ts`)은 이미 확정되어 있어 그대로 유지
- **핵심 제약**: 사용자 이메일은 `auth.users`에만 있고 `public.profiles`에는 없음. 관리자 사용자 테이블(F014)이 이메일을 표시하려면 `auth.users`를 조회해야 하는데, 이는 `service_role` 키를 쓰는 Admin 클라이언트 없이는 불가능
- **핵심 제약 2**: `events` DELETE RLS 정책은 `auth.uid() = created_by`만 허용, `profiles`는 DELETE 정책 자체가 없음. 관리자가 "남의" 이벤트/사용자를 삭제하려면 RLS를 우회하는 `service_role` 클라이언트가 필요 — 단, **호출부에서 반드시 현재 세션이 실제 admin인지 애플리케이션 코드로 재검증**해야 함 (RLS가 꺼진 채로 동작하므로 이 검증 누락은 곧 권한 상승 취약점)
- 결론: `service_role` 키를 `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY`로 추가함 (사용자가 Supabase 대시보드에서 직접 발급, 이 세션에서 값 자체는 다루지 않음). `lib/supabase/admin.ts`에 서버 전용 Admin 클라이언트를 새로 만든다
- `AdminEventTable`/`AdminUserTable`은 이미 검색/필터를 클라이언트 사이드에서 완전히 구현해뒀음(F013/F014의 "검색/필터" 요구사항 충족) — 서버는 전체 목록만 넘겨주면 되고, 별도 검색 API는 불필요
- `AdminAnalyticsCharts`의 기간 선택(`period` state)은 UI만 있고 목업이 7일치뿐이라 실제 재조회가 연결되어 있지 않음(`TODO(Task 011)`) — 이번에 `getAnalyticsSummary(period)` 형태로 실제 집계 연동
- 페이지네이션/정렬: 이벤트·사용자 수가 초기 단계에 많지 않을 것으로 예상되고, 기존 UI가 클라이언트 사이드 필터링을 이미 구현해뒀으므로 서버 페이지네이션은 이번 범위에서 제외 — 전체 목록을 한 번에 가져오는 것으로 충분 (규모가 커지면 후속 Task로 분리)

## 구현 사항

- [x] `lib/supabase/admin.ts` 신규 생성 — `SUPABASE_SERVICE_ROLE_KEY`로 `createClient`(supabase-js, RLS 우회) 생성하는 `createAdminClient()`. `persistSession: false`로 서버 전용 인스턴스임을 명시
- [x] `lib/actions/admin.ts`에 `requireAdmin()` 헬퍼 추가 — 세션 확인 + `profiles.role === 'admin'` 확인, 모든 관리자 Server Action(`deleteEventAsAdmin`/`deleteUserAsAdmin`/`fetchAnalyticsSummary`)의 첫 줄에서 호출
- [x] `lib/queries/admin.ts` 신규 생성
  - [x] `getDashboardMetrics()` — `{ count: 'exact', head: true }`로 오늘/이번 주/이번 달/전체 이벤트 수, 오늘/이번 주/전체 사용자 수 집계
  - [x] `getAdminEvents()` — 전체 이벤트 목록 + host 이름 + 참여자 수 + 상태(파생 계산) 조인
  - [x] `getAdminUsers()` — 전체 프로필 목록 + Admin 클라이언트로 이메일 조회(`auth.admin.listUsers()`) + 만든/참여한 이벤트 수 집계
  - [x] `getAnalyticsSummary(period: AnalyticsPeriod)` — 총 이벤트/사용자/평균 참여자 수 + 기간별(7d/30d/90d) 일자별 이벤트·사용자 생성 추이
- [x] `lib/actions/admin.ts` 신규 생성
  - [x] `deleteEventAsAdmin(eventId: string)` — `requireAdmin()` 통과 후 Admin 클라이언트로 삭제, `revalidatePath('/admin/events')` + `/admin/dashboard`
  - [x] `deleteUserAsAdmin(userId: string)` — `requireAdmin()` 통과 + 자기 자신 삭제 방지(서버에서도 재검증) 후 `auth.admin.deleteUser()`로 완전 삭제(profiles/event_participants는 `on delete cascade`로 함께 삭제됨)
  - [x] `fetchAnalyticsSummary(period)` — 통계 페이지의 기간 변경 재조회용 액션 (계획에 없던 추가 — 아래 범위 확장 참고)
- [x] `app/(admin-dashboard)/admin/dashboard/page.tsx`를 Server Component로 전환, `getDashboardMetrics()` 호출로 목업 교체
- [x] `app/(admin-dashboard)/admin/events/page.tsx`를 Server Component로 전환, `getAdminEvents()` 호출로 목업 교체
- [x] `app/(admin-dashboard)/admin/users/page.tsx`를 Server Component로 전환, `getAdminUsers()` 호출 + 실제 로그인한 관리자 ID를 `currentUserId`로 전달(하드코딩된 `"user-4"` 제거)
- [x] `components/admin-event-table.tsx`의 `handleDelete`를 `deleteEventAsAdmin` 액션 호출로 교체, TODO 주석 제거
- [x] `components/admin-user-table.tsx`의 `handleDelete`를 `deleteUserAsAdmin` 액션 호출로 교체, TODO 주석 제거
- [x] `components/admin-analytics-charts.tsx`를 `useTransition` + `fetchAnalyticsSummary` Server Action으로 기간 변경 시 실제 재조회하도록 수정

### 범위 확장: 레이아웃의 Cache Components 빌드 실패 수정

`npm run build` 실행 중 관리자 라우트 4개(`/admin/dashboard`, `/admin/events`, `/admin/users`, `/admin/analytics`) 모두 prerender 단계에서 빌드가 실패하는 걸 발견했다. `--debug-prerender`로 확인한 원인은 `app/(admin-dashboard)/layout.tsx`(Task 008에서 작성, 이번 세션 변경 아님)가 `cookies()`를 `<Suspense>` 밖에서 직접 호출하고 있었기 때문 — 각 page.tsx에 `<Suspense>`를 추가하는 것만으로는 해결되지 않고(레이아웃과 페이지의 Suspense 경계는 독립적), 레이아웃의 인증 체크 로직 자체를 `RequireAdmin` 서브컴포넌트로 분리해 `<Suspense>`로 감싸야 했다. 이 수정 없이는 Task 011의 페이지 전환과 무관하게 프로덕션 빌드 자체가 불가능한 상태였으므로 범위에 포함했다.

## 수락 기준

- `/admin/dashboard`에 실제 DB의 이벤트/사용자 수가 정확히 집계되어 표시된다
- `/admin/events`에 실제로 생성된 모든 이벤트가 나타나고, 검색/상태 필터가 정상 동작하며, 삭제 시 실제로 DB에서 제거된다(다른 사용자가 만든 이벤트도 삭제 가능)
- `/admin/users`에 실제 가입자 목록과 이메일이 표시되고, 검색/역할 필터가 정상 동작하며, 삭제 시 `auth.users`와 `profiles`가 모두 제거된다. 자기 자신은 삭제 버튼이 비활성화된다
- `/admin/analytics`의 기간 드롭다운(7일/30일/90일)을 바꾸면 실제로 해당 기간의 데이터로 차트가 갱신된다
- admin이 아닌 일반 사용자가 관리자 Server Action을 직접 호출해도(레이아웃 우회 시도) 서버에서 거부된다

## 테스트 체크리스트 (Claude in Chrome)

DB에 admin 역할 계정이 아직 없어(Task 008부터 이어진 미검증 상태), 기존 로그인 계정(정석)을 SQL로 임시 승격해 검증 후 다시 `user`로 원복하는 방식으로 진행했다.

- [x] admin 계정으로 로그인 후 `/admin/dashboard` 접속 → 지표 카드 숫자(전체 사용자 2명 등)가 실제 DB 상태와 일치함을 확인
- [x] `/admin/events`에서 목업 대신 실제 이벤트 목록(제목/주최자/날짜/참여자 수/상태/생성일)이 정확히 표시됨을 확인
- [x] `/admin/events`에서 테스트 이벤트를 생성해 삭제 → 다이얼로그 확인 후 목록에서 사라지고, DB SQL 조회로 실제 삭제됨을 확인
- [x] `/admin/users`에서 이메일이 `auth.users` 기반으로 정상 표시됨을 확인 (`anmh0121@naver.com`, `ojs933327@gmail.com`)
- [x] `/admin/users`에서 관리자 자신(정석)의 행만 삭제 버튼이 `disabled` + `title="자신은 삭제할 수 없어요"`로 비활성화됨을 DOM에서 확인
- [x] `/admin/analytics`에서 기간을 7일→30일로 변경 → 차트 X축과 데이터 포인트가 실시간으로 재조회되어 갱신됨을 확인 (`fetchAnalyticsSummary` 정상 동작)
- [x] role을 `user`로 원복한 뒤 같은 세션으로 `/admin/dashboard` 재접근 → `/admin/login?error=forbidden`으로 정상 리다이렉트됨을 확인 (Task 008 기능 회귀 없음)
- [ ] `/admin/users`에서 실제 사용자 삭제(`auth.admin.deleteUser`) 실행: DB의 유일한 삭제 후보 계정이 실사용자 이메일(`anmh0121@naver.com`)로 가입된 계정이라 데이터 보존을 위해 실행 보류, 대신 `deleteUserAsAdmin` 코드 리뷰로 로직 검증(`requireAdmin` + 자기 자신 방지 + `on delete cascade` 확인)
- [ ] `/admin/events`에서 검색어/상태 필터 조합 자체는 Task 006에서 이미 구현된 클라이언트 로직이라 이번 회귀 대상에서 제외(변경 없음)

## 관련 파일

- `lib/supabase/admin.ts` (신규)
- `lib/queries/admin.ts` (신규)
- `lib/actions/admin.ts` (신규)
- `app/(admin-dashboard)/layout.tsx` (수정 — Cache Components 빌드 실패 수정)
- `app/(admin-dashboard)/admin/dashboard/page.tsx` (수정)
- `app/(admin-dashboard)/admin/events/page.tsx` (수정)
- `app/(admin-dashboard)/admin/users/page.tsx` (수정)
- `app/(admin-dashboard)/admin/analytics/page.tsx` (수정)
- `components/admin-event-table.tsx` (수정)
- `components/admin-user-table.tsx` (수정)
- `components/admin-analytics-charts.tsx` (수정)
- `lib/mock/admin.ts`, `lib/mock/events.ts` (삭제 — 더 이상 참조되지 않는 목업 데이터)
- `.env.local` (수정 — `SUPABASE_SERVICE_ROLE_KEY` 추가)
