# 모임 이벤트 관리 웹 MVP — PRD 겸 구현 계획

## Context (배경 및 목적)

수영/헬스/친구 모임의 주최자는 공지 전달, 참여자 관리, 카풀 조율, 정산까지 혼자 도맡는 경우가 많다. 특히 정기 모임(매주 화요일 수영모임 등)은 같은 멤버가 반복 참여하는데도, 회차마다 공지·참여 확인·비용 정산을 수동(카톡방)으로 반복해야 해서 주최자의 피로도가 높다.

이 프로젝트는 Next.js 16 + Supabase Auth 스타터킷 상태이며, 인증(이메일/비밀번호 + Google OAuth)만 구축돼 있고 모임 관련 기능은 전무한 그린필드 상태다. 이번 작업은 **코드 구현이 아니라 MVP의 제품/기술 설계(PRD)를 확정**하는 것이다 — 실제 구현은 이후 별도 작업으로 진행한다.

### 확정된 MVP 스코프
1. **통합 올인원**: 공지 + 참여자 관리 + 카풀 + 정산을 하나의 앱에서 처리
2. **타겟**: 정기 모임 중심(수영/헬스류) — 같은 멤버가 반복 참여
3. **구조**: 모임(그룹) > 회차(이벤트) 2단계 계층
4. **인증/참여**: 전원 회원가입 필수(게스트 없음). 그룹 가입은 주최자가 발급한 초대 링크/코드로만 가능
5. **카풀**: 실시간 매칭 없음 — "운전 가능/동승 필요" 게시판 + 댓글로 조율
6. **정산**: PG 연동 없음 — 총비용을 N분의 1 자동 계산, 계좌번호 안내, 참여자 자가체크 → 주최자 최종 확인
7. **알림**: 앱 내 알림만 (이메일/푸시 인프라 없음)
8. **그룹 생성**: 로그인 사용자 누구나 가능, 생성자가 자동으로 organizer
9. **회차 기본 참여 상태**: opt-in — 회차 생성 시 참여자 0명에서 시작, 멤버가 각자 참여/불참/미정을 직접 표시

### Out of Scope (MVP 이후로 명시적으로 미룸)
- PG 결제 연동, 실시간 위치 기반 카풀 매칭
- 이메일/푸시 알림
- 비정기·일회성 모임 지원, 게스트(비회원) 참여
- 회차 자동 반복 생성(RRULE), 공동 주최자/세분화된 권한
- 정산 부분 배정(균등 N분의 1만 지원), 그룹 소유권 이전
- 다국어/타임존 처리

---

## 1. Supabase 데이터 모델

기존 마이그레이션(`supabase/migrations/20260813120000_create_profiles_table.sql`)의 컨벤션을 그대로 따른다: 소문자 SQL, 한글 `comment on table`, RLS는 `to authenticated`/`to anon` 명시 + `using`/`with check` 쌍, 트리거 함수는 `security definer` + `set search_path = ''`, 트리거 전용 함수는 `revoke execute ... from anon, authenticated, public`.

### 1.1 테이블 구조

```
auth.users ─1:1─ profiles
                    │
   ┌────────────────┼──────────────────────────┐
   │ created_by      │ user_id                   │
   ▼                 ▼                            │
groups ──1:N─ group_members ◄──────────────────────┘
   │                ▲ invited_by_code (nullable FK)
   │ 1:N             │
   ▼                 │
group_invites ────────┘

groups ─1:N─ events ─1:N─ event_participants (user_id → profiles)
               │
               ├─1:N─ announcements (group_id 필수, event_id nullable)
               ├─1:N─ carpool_posts ─1:N─ carpool_comments
               └─1:1─ settlements ─1:N─ settlement_payments (participant_id → event_participants)
```

**테이블별 핵심 컬럼** (전체 컬럼/제약은 구현 단계에서 마이그레이션 파일 작성 시 확정):

- `groups`: id, name, description, category, created_by(FK profiles, on delete restrict), is_archived, created_at/updated_at
- `group_members`: id, group_id, user_id, role(`organizer`|`member`), invited_by_code(FK group_invites.code, on delete set null), joined_at, `UNIQUE(group_id, user_id)`
- `group_invites`: id, group_id, code(unique, 랜덤 8자리), created_by, max_uses, used_count, expires_at, revoked_at
- `events`: id, group_id, title, event_date, start_time, location, description, status(`scheduled`|`completed`|`cancelled`), created_by
- `event_participants`: id, event_id, user_id, status(`attending`|`not_attending`|`maybe`), responded_at, `UNIQUE(event_id, user_id)` — **회차 생성 시 자동 row 생성 없음(opt-in)**, 멤버가 처음 상태를 선택할 때 insert
- `announcements`: id, group_id(필수), event_id(nullable — null이면 그룹 전체 공지), title, content, created_by, is_pinned
- `carpool_posts`: id, event_id, author_id, type(`offer`|`request`), departure_point, available_seats, content, status(`open`|`closed`)
- `carpool_comments`: id, post_id, author_id, content
- `settlements`: id, event_id(unique — 회차당 1건), total_amount, participant_count(스냅샷), amount_per_person(스냅샷, `ceil` 계산), bank_name, account_number, account_holder, memo, status(`open`|`closed`), created_by
- `settlement_payments`: id, settlement_id, participant_id(FK event_participants), self_checked_at, confirmed_at, confirmed_by, `UNIQUE(settlement_id, participant_id)` — 상태는 파생값(미입금/자가체크완료/확인완료)으로 컬럼 없이 판단

모든 테이블에 `handle_updated_at()` 트리거를 부착(신규 테이블 중 수정 가능한 것들: groups, events, announcements, carpool_posts, settlements). `created_at`/`updated_at`은 기존 profiles 패턴과 동일하게 `timestamptz not null default now()`.

### 1.2 RPC 함수 (일반 insert/update 정책으로 표현 불가능한 로직)

일반 RLS 정책만으로는 "코드 검증 후 가입", "컬럼별로 다른 사람이 쓰는 UPDATE" 같은 로직을 안전하게 표현할 수 없으므로, `handle_new_user()`와 동일한 `security definer` 패턴으로 다음 함수들을 만든다:

- `join_group_with_code(p_code text)`: 코드 유효성(만료/폐기/max_uses) 검증 → `group_members` insert → `group_invites.used_count` 증가. 클라이언트는 `group_invites`에 직접 쓰기 권한 없음
- `create_settlement(p_event_id uuid, p_total_amount int, p_bank_name text, p_account_number text, p_account_holder text, p_memo text)`: `settlements` insert(participant_count/amount_per_person 계산 포함) + 해당 회차의 attending 참여자 전원에 대해 `settlement_payments` row 일괄 생성을 원자적으로 처리
- `mark_payment_self_checked(p_payment_id uuid)`: 본인 소유 payment만 `self_checked_at` 갱신
- `confirm_payment(p_payment_id uuid)`: organizer만 `confirmed_at`/`confirmed_by` 갱신

각 RPC는 실행 권한을 `grant execute ... to authenticated`로 명시하고, `handle_new_user()`처럼 트리거 전용이 아니므로 revoke하지 않는다.

### 1.3 RLS 정책 방향

공통 헬퍼 함수 `is_group_member(p_group_id uuid)` / `is_group_organizer(p_group_id uuid)`를 `security definer`로 만들어 반복되는 멤버십 체크 서브쿼리를 대체한다.

| 테이블 | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `groups` | 그룹 멤버만 | 생성은 로그인 사용자 누구나(트리거로 생성자를 organizer로 자동 추가) / 수정·삭제는 organizer만 |
| `group_members` | 같은 그룹 멤버만 | insert는 RPC 경유만(직접 정책 없음) / 역할변경·추방은 organizer, 탈퇴는 본인 |
| `group_invites` | organizer만 | organizer만 |
| `events` | 그룹 멤버만 | organizer만 |
| `event_participants` | 같은 그룹 멤버만 | 본인 row만 insert/update(자기 참여상태), delete는 본인 또는 organizer |
| `announcements` | 그룹 멤버만 | organizer만 |
| `carpool_posts`/`carpool_comments` | 그룹 멤버만 | 그룹 멤버 누구나 작성(본인이 author), 수정/삭제는 작성자 본인(또는 organizer가 삭제) |
| `settlements` | 그룹 멤버만 | organizer만(RPC 경유) |
| `settlement_payments` | 그룹 멤버 전체 공개(입금 현황은 다같이 보는 것이 정산 압박에 유효) | 컬럼별 권한 분리가 필요해 RPC 2종(`mark_payment_self_checked`, `confirm_payment`)으로만 갱신 |

신규 테이블은 전부 `auth.users`가 아닌 `public.profiles(id)`를 참조(기존 컨벤션 유지).

### 1.4 타입 재생성

테이블 설계 확정 후 `mcp__supabase__generate_typescript_types` 또는 `supabase gen types typescript`로 `lib/supabase/types.ts`를 재생성해 `instruments`/`profiles` 외 신규 테이블 타입을 반영한다.

---

## 2. 페이지/라우트 구조 (App Router, `src/` 없이 루트 기준)

```
app/protected/
├── layout.tsx                              (기존 유지 + "내 모임" 네비게이션 추가)
├── page.tsx                                 → 대시보드: 내 그룹 목록 + 다가오는 회차 요약
├── groups/
│   ├── page.tsx                              → 내 그룹 목록 + "그룹 만들기"
│   ├── new/page.tsx                          → 그룹 생성 폼
│   └── [groupId]/
│       ├── layout.tsx                        → 멤버십 검증(비멤버 리다이렉트) + 탭 네비게이션
│       ├── page.tsx                           → 그룹 홈(최근 공지 + 다가오는 회차)
│       ├── members/page.tsx                   → 멤버 목록/역할, organizer는 추방 가능
│       ├── invite/page.tsx                    → (organizer) 초대 코드 발급/관리
│       ├── announcements/
│       │   ├── page.tsx                        → 그룹 공지 목록
│       │   └── new/page.tsx                    → 공지 작성(organizer)
│       ├── settings/page.tsx                   → (organizer) 그룹 정보 수정/보관
│       └── events/
│           ├── page.tsx                         → 회차 목록(예정/지난)
│           ├── new/page.tsx                     → 회차 생성(organizer)
│           └── [eventId]/
│               ├── layout.tsx                    → 탭 네비게이션(개요/카풀/정산)
│               ├── page.tsx                       → 개요: 참여상태 토글, 참여자 목록, 회차 공지
│               ├── carpool/
│               │   ├── page.tsx                   → 카풀 게시판(운전/동승 필터)
│               │   ├── new/page.tsx               → 글 작성
│               │   └── [postId]/page.tsx          → 상세 + 댓글
│               └── settlement/page.tsx             → 정산(미생성 시 organizer용 생성 폼 / 생성 후 현황판)
└── invite/[code]/page.tsx                    → 초대 링크 진입점(그룹 미리보기 → 가입 확인)
```

### 컴포넌트 경계 원칙
- 기본은 Server Component. Supabase 조회는 `lib/supabase/server.ts`의 `createClient()`로 서버에서 수행
- `'use client'`는 실제 인터랙션이 필요한 리프 컴포넌트에만 최소 적용(기존 `components/login-form.tsx` 패턴 참고): 그룹/회차/공지/카풀/정산 생성 폼, 참여상태 토글, 입금 자가체크/확인 버튼, 초대코드 복사 버튼
- 폼 제출은 Server Actions로 처리(기존 프로젝트에 API Route 패턴이 없고, `route.ts`는 OAuth 콜백 등 외부 리다이렉트가 필요한 경우로 한정돼 있음)

### Cache Components 대응 (`cacheComponents: true`)
`app/protected/page.tsx`의 `UserDetails`처럼, 요청마다 달라지는 Supabase 조회는 별도 async 컴포넌트로 분리해 `<Suspense fallback={...}>`로 감싼다. 특히 참여자 목록, 정산 현황판(입금 상태가 자주 바뀜)은 개별 Suspense 경계로 나눠 부분 갱신이 페이지 전체 재렌더를 유발하지 않게 한다. `groups/[groupId]/layout.tsx`의 멤버십 검증(`redirect()`)은 동적 처리가 불가피하므로 레이아웃은 멤버십 확인만 하고 데이터 프리페치는 각 페이지의 Suspense 경계에 위임한다. 폼 제출 후 목록 갱신은 Server Action에서 `revalidatePath()` 호출.

---

## 3. 핵심 유저 플로우

### 주최자(Organizer)
그룹 생성(`/protected/groups/new`, 생성자 자동 organizer) → 초대 코드 발급(`/protected/groups/[groupId]/invite`) → 회차 생성(`events/new`) → 공지 작성 → 정산 생성(총비용/계좌 입력 → `create_settlement` RPC → attending 인원 기준 자동 N분의1 계산 → `settlement_payments` 일괄 생성) → 입금 확인(자가체크된 항목을 `confirm_payment`로 확인)

### 참여자(Member)
초대 링크(`/invite/[code]`) 접속 → 미로그인 시 `/auth/login?next=/invite/[code]`로 유도(기존 Proxy 리다이렉트 로직 재사용) → 로그인 후 그룹 미리보기 확인 → 가입(`join_group_with_code` RPC) → 회차별로 참여/불참/미정 직접 표시(opt-in, `event_participants` upsert) → 카풀 게시글 작성/댓글로 조율 → 정산 확인 후 이체 → "입금완료" 자가체크(`mark_payment_self_checked`)

### 접근 제어
비로그인 → `/protected/*`, `/invite/[code]` 접근 시 기존 Proxy가 `/auth/login`으로 리다이렉트(이미 구현됨). 로그인했지만 비멤버 → `groups/[groupId]/layout.tsx`에서 차단 후 `/protected/groups`로 리다이렉트. organizer 전용 액션은 RLS가 최종 방어선이되, UX상 버튼도 role 기준으로 조건부 렌더링.

---

## 4. 신규 설치 항목

**shadcn/ui** (`npx shadcn@latest add ...`): `table`(정산/멤버 목록), `dialog`(모달), `form`(react-hook-form 결합), `select`(참여상태/카풀타입), `tabs`(그룹/회차 탭), `avatar`, `sonner`(토스트), `textarea`(공지/카풀/댓글). 기존 설치된 `badge`, `button`, `card`, `checkbox`, `input`, `label`, `dropdown-menu`는 재사용.

**라이브러리**: `react-hook-form` + `zod` + `@hookform/resolvers`(폼 다수, 클라이언트/서버 양쪽 검증 — zod 스키마를 `lib/validations/*.ts`에 두고 Server Action에서 재검증), `date-fns`(+ `date-fns/locale/ko`, 회차 날짜 포맷·만료 계산). 별도 상태관리 라이브러리는 불필요(Server Component + Server Actions + `revalidatePath` 조합으로 충분).

---

## 5. 검증 방법 (구현 단계 진입 시)

1. `mcp__supabase__list_tables`로 마이그레이션 적용 전후 스키마 diff 확인
2. `mcp__supabase__apply_migration`으로 로컬/개발 프로젝트에 적용 후 `mcp__supabase__get_advisors`로 RLS 누락·보안 경고 점검
3. `npm run typecheck`로 재생성된 `Database` 타입과 신규 컴포넌트 간 타입 정합성 확인
4. 핵심 플로우(그룹 생성 → 초대 코드 → 가입 → 회차 생성 → 참여 표시 → 정산 생성 → 입금 확인)를 Playwright MCP로 브라우저 E2E 확인 — 주최자 계정과 참여자 계정(시크릿 창 또는 별도 세션) 두 개로 실제 초대~정산까지 흐름 시연
5. `npm run lint` — Husky pre-commit이 자동 실행하지만, 대량 신규 파일 작성 시 중간 점검용으로 수동 실행

---

## 다음 단계 제안

이 문서는 PRD/설계 확정 단계이며, 실제 구현은 범위가 크므로(테이블 9개, RPC 4개, 라우트 20개 이상) 다음 중 하나로 이어가는 것을 권장한다:
- `docs/prd-generator` 서브에이전트로 이 설계를 정식 PRD 문서화
- `development-planner` 서브에이전트로 `ROADMAP.md`에 Phase별(DB 마이그레이션 → 그룹/초대 → 회차/참여 → 공지 → 카풀 → 정산 순) 작업 분해
- 또는 이 계획을 승인 후 바로 Phase 1(DB 마이그레이션)부터 구현 착수
