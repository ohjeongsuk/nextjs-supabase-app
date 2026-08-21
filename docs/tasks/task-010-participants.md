# Task 010: 참여자 관리

## 개요

- **목표**: 초대 링크를 통한 실제 참여 로직을 구현하고, 참여자 수를 실시간으로 반영한다
- **예상 소요 시간**: 1일
- **관련 기능**: F004(초대 링크로 참여), F007(내가 참여한/만든 이벤트 목록)
- **의존성**: Task 007(DB 스키마), Task 009(이벤트 CRUD·초대 코드·조회 로직)

## 배경 / 현재 상태

- `lib/queries/events.ts`의 `getHostedEvents`/`getJoinedEvents`/`getEventById`/`getEventByInviteCode`는 Task 009에서 이미 실 DB 연동 완료 — 이번 Task는 **조회가 아닌 쓰기(참여)** 에 집중한다
- `components/join-event-card.tsx:45`에 `TODO(Task 010): 초대 링크 참여 API 연동` 자리표시자가 있고, 현재는 `console.log` + 낙관적 toast만 표시하고 실제 DB에는 반영되지 않는다
- `event_participants` 테이블에는 이미 `UNIQUE(event_id, user_id)` 제약이 걸려 있어 DB 레벨 중복 참여 방지는 되어 있음 — 애플리케이션은 이 제약 위반(에러 코드 `23505`)을 사용자 친화적으로 처리하기만 하면 됨
- RLS: `event_participants` INSERT 정책은 `auth.uid() = user_id`만 요구 — 본인 명의로만 참여 가능, host 여부와 무관하게 누구나 참여 row를 생성할 수 있음
- **발견된 결함**: `lib/actions/events.ts`의 `createEvent`가 이벤트를 만들 때 host를 `event_participants`에 넣지 않아, 방금 만든 이벤트의 "참여자 수"에 host 자신이 포함되지 않는 문제가 있음. 이번 Task에서 `createEvent` 트랜잭션에 host row(`role: 'host'`) insert를 추가해 함께 수정한다
- Realtime: `supabase_realtime` publication에 `events`/`event_participants` 테이블이 아직 등록되어 있지 않음 — 이번 Task에서 `event_participants`를 publication에 추가해야 실시간 구독이 동작함

## 구현 사항

- [x] `event_participants`를 Supabase Realtime publication에 추가하는 마이그레이션 작성 (`ALTER PUBLICATION supabase_realtime ADD TABLE event_participants`) — `20260821021557_enable_realtime_event_participants.sql`
- [x] `event_participants`의 `REPLICA IDENTITY`를 `FULL`로 변경 — DELETE 이벤트가 서버 사이드 필터(`event_id=eq.xxx`)를 통과하려면 PK 외 컬럼도 `old` 레코드에 필요 (`20260821021600_set_replica_identity_full_event_participants.sql`, 구현 중 발견해 추가)
- [x] `lib/actions/participants.ts` 신규 생성 — `joinEvent(inviteCode: string)` Server Action
  - [x] 세션 확인, 미인증 시 에러 반환 (클라이언트가 로그인 유도를 이미 처리)
  - [x] `invite_code`로 이벤트 조회 → 없으면 에러 반환
  - [x] `event_participants`에 `role: 'participant'`로 insert
  - [x] `UNIQUE(event_id, user_id)` 위반(`23505`)을 성공으로 취급해 정상 흐름 유지
  - [x] 성공 시 `revalidatePath('/events')`, `revalidatePath('/events/[id]')` 호출
- [x] `lib/actions/events.ts`의 `createEvent`에 host 자동 참여 로직 추가
  - [x] 이벤트 insert 성공 직후 `event_participants`에 `{ event_id: data.id, user_id: userId, role: 'host' }` insert
  - [x] insert 실패 시 방금 생성된 이벤트를 삭제하는 보상 처리 추가
- [x] `components/join-event-card.tsx`의 `handleJoin`을 `joinEvent` 액션 호출로 교체, TODO 주석 제거
- [x] `components/participants-section.tsx` 신규 생성 (Client Component) — 참여자 수 표시와 목록을 함께 관리하며 Supabase Realtime `postgres_changes`로 `event_participants` INSERT/DELETE 구독 (계획 당시의 `participant-count.tsx`에서 범위를 확장 — 목록까지 실시간 반영하려면 카운트만 분리해선 안 되고 목록 상태 자체를 클라이언트가 들고 있어야 함)
- [x] `app/(main)/events/[id]/page.tsx`에서 참여자 수+목록 표시 부분을 `<ParticipantsSection>`으로 교체, 초기값은 서버에서 조회한 `event.participants`로 hydration
- [x] 참여자 목록도 실시간으로 추가/제거되도록 반영 — INSERT 시 `profiles`를 별도 조회해 카드 데이터 조립, DELETE 시 목록에서 제거

## 수락 기준

- 로그인한 사용자가 초대 링크(`/join/[invite_code]`)에서 "참여하기"를 누르면 `event_participants`에 실제 row가 생성되고 이벤트 상세 페이지로 이동한다
- 이미 참여한 사용자가 같은 초대 링크로 다시 "참여하기"를 눌러도 에러 없이 상세 페이지로 이동한다 (중복 row가 생기지 않음)
- 새 이벤트를 생성하면 즉시 참여자 수가 1명(호스트 본인)으로 표시된다
- 한 브라우저 탭에서 이벤트 상세 페이지를 열어둔 상태로 다른 사용자가 참여하면, 새로고침 없이 참여자 수와 목록이 갱신된다
- 로그인하지 않은 사용자가 초대 링크에서 "참여하기"를 누르면 Google 로그인으로 유도되고, 로그인 완료 후 원래 초대 페이지로 돌아와 참여가 이어진다 (기존 `redirectTo` 흐름 유지)

## 테스트 체크리스트 (Playwright MCP / Claude in Chrome)

- [x] 로그인 계정(정석)으로 새 이벤트 생성 → 상세 페이지에서 참여자 수가 즉시 1명(본인, "주최자" 배지)으로 표시됨 확인 — `createEvent`의 host 자동 참여 정상 동작
- [x] 동일 계정으로 자신이 만든 이벤트의 초대 링크(`/join/[invite_code]`)에 재접속해 "참여하기" 클릭 → 에러 토스트 없이 "이벤트에 참여했어요" 토스트 + 상세 페이지 이동, 참여자 수가 그대로 1명(중복 row 미생성, DB로 재확인) — 중복 참여 방지(`23505` 처리) 정상 동작
- [x] 이벤트 상세 페이지를 연 상태에서 DB에 직접 `event_participants` INSERT → 새로고침 없이 참여자 수/목록 실시간 갱신 확인
- [x] 같은 상태에서 DELETE → 새로고침 없이 참여자 수/목록 실시간 갱신 확인. **1차 시도에서 DELETE 이벤트가 반영되지 않는 결함 발견 및 수정** (아래 발견 사항 참고)
- [x] 존재하지 않는 초대 코드(`/join/INVALID9`)로 접근 시 Next.js 404 페이지 정상 표시 확인
- [x] `/events` 페이지 "내가 만든 이벤트" 탭 정상 동작 확인 (F007 회귀 테스트, 테스트 데이터 정리 후 빈 상태로 정상 복귀)
- [ ] 비로그인 상태 → Google OAuth 리다이렉트: 실계정 로그인 세션만 사용 가능해 미검증 (기존 `signInWithOAuth` 흐름은 코드 변경 없음, Task 008에서 검증된 것과 동일 경로)
- [ ] 별도 사용자 계정으로 실제 참여자 UI 클릭 플로우: 테스트 가능한 2번째 Google 계정이 없어 DB 직접 조작으로 대체 검증

### 발견 및 수정한 결함: Realtime DELETE 이벤트 미수신

`event_participants` 테이블의 기본키는 `id`뿐이고 `REPLICA IDENTITY`가 기본값(`DEFAULT`, PK만 포함)이었다. Realtime 구독의 서버 사이드 필터(`event_id=eq.${eventId}`)는 DELETE 이벤트의 `old` 레코드에서 `event_id` 컬럼을 찾는데, PK가 아닌 이 컬럼이 `old`에 없어 필터가 항상 거짓으로 평가되며 DELETE 이벤트 자체가 클라이언트에 전달되지 않았다. `ALTER TABLE event_participants REPLICA IDENTITY FULL` 마이그레이션으로 해결(`supabase/migrations/20260821021600_set_replica_identity_full_event_participants.sql`). 수정 후 재검증 완료.

## 관련 파일

- `lib/actions/participants.ts` (신규)
- `lib/actions/events.ts` (수정 — `createEvent`에 host 자동 참여 추가)
- `components/join-event-card.tsx` (수정)
- `components/participants-section.tsx` (신규)
- `app/(main)/events/[id]/page.tsx` (수정)
- `supabase/migrations/20260821021557_enable_realtime_event_participants.sql` (신규)
- `supabase/migrations/20260821021600_set_replica_identity_full_event_participants.sql` (신규)
