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
