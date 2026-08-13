# profiles 미생성 문제 원인 분석 및 백필 계획

## Context

이전 작업에서 `public.profiles` 테이블과 `auth.users` INSERT 시 자동으로 row를 만드는 트리거(`handle_new_user` / `on_auth_user_created`)를 만들었다. 그런데 사용자가 회원가입 후 확인해보니 `profiles` 테이블에 row가 생기지 않았다고 보고했다.

## 원인 조사 결과

DB를 직접 조회해 다음을 확인했다:

- `auth.users`에는 사용자가 1명 존재 (`ojs933327@gmail.com`, `created_at: 2026-08-13 06:38:26`)
- `public.profiles`는 0건
- 트리거 `on_auth_user_created`는 `tgenabled: "O"`(활성화 상태)이며 `handle_new_user` 함수를 정상적으로 가리키고 있음
- 마이그레이션 적용 시각(`list_migrations`): `20260813073818` → `07:38:18`

**결론**: 이 사용자는 `profiles` 테이블/트리거가 생성되기 약 1시간 전(`06:38:26`)에 이미 가입을 완료한 상태였다. 트리거는 "이후에 발생하는" `auth.users` INSERT에만 반응하므로, 트리거 생성 이전에 가입한 기존 사용자에게는 소급 적용되지 않는다. 즉 트리거 로직 자체의 결함이 아니라, **기존 가입자에 대한 백필이 빠졌던 것**이 근본 원인이다.

## 해결 방안

1. **백필 마이그레이션**: `auth.users`에는 있지만 `public.profiles`에는 없는 사용자를 찾아 트리거와 동일한 로직(username 기본값 생성 포함)으로 INSERT하는 1회성 마이그레이션을 작성해 적용한다. `not exists` 조건으로 이미 profile이 있는 사용자는 건드리지 않아, 앞으로 이 마이그레이션을 다시 실행해도 안전(idempotent)하게 만든다.
2. **트리거 정상 동작 재검증**: 백필 후 신규 가입 트리거가 실제로 작동하는지 확인한다. 브라우저 자동화가 안 되므로, 사용자에게 재가입 테스트를 요청하거나 `auth.admin` API 기반 테스트 방법을 안내한다.

## 백필 마이그레이션 SQL

파일: `supabase/migrations/20260813140000_backfill_profiles.sql`

```sql
-- profiles 트리거 생성 이전에 가입한 기존 사용자를 위한 1회성 백필
-- (idempotent: 이미 profile이 있는 사용자는 건너뜀)
insert into public.profiles (id, username, full_name, avatar_url)
select
  u.id,
  coalesce(
    u.raw_user_meta_data ->> 'username',
    split_part(u.email, '@', 1) || '_' || substr(u.id::text, 1, 8)
  ),
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
```

트리거 함수(`handle_new_user`)의 username 생성 로직과 완전히 동일하게 맞춰 일관성을 유지한다.

## 적용 순서

1. `mcp__supabase__apply_migration`으로 위 SQL을 원격 DB에 적용 (name: `backfill_profiles`)
2. 동일 SQL을 로컬 `supabase/migrations/20260813140000_backfill_profiles.sql` 파일로도 저장
3. `mcp__supabase__execute_sql`로 `select count(*) from public.profiles;` 실행해 1건 이상 생성됐는지 확인
4. `mcp__supabase__execute_sql`로 생성된 row의 `username`이 예상 형식(`이메일앞부분_uuid8자리`)인지 확인
5. `mcp__supabase__get_advisors`(security)로 새로운 경고가 없는지 재확인

## 향후 재발 방지 확인

신규 가입 시 트리거가 실제로 도는지 검증이 필요하다. 사용자에게 다음 중 하나를 요청:
- 새 이메일(또는 Gmail 플러스 주소, 예: `ojs933327+test1@gmail.com`)로 재가입 테스트 후 `profiles`에 즉시 반영되는지 확인
- 또는 브라우저 확장(Claude in Chrome) 연결 후 자동화 테스트 지원 가능함을 안내

## 수정/생성 파일 목록

- `supabase/migrations/20260813140000_backfill_profiles.sql` (신규, 백필용)
