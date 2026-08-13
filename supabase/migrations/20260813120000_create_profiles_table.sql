-- profiles 테이블: auth.users의 공개 프로필 정보를 저장
create table public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint username_length check (char_length(username) >= 3)
);

comment on table public.profiles is '회원가입한 사용자의 공개 프로필 정보. auth.users와 1:1 매핑.';

-- RLS 활성화
alter table public.profiles enable row level security;

-- 전체 공개 조회 허용 (비로그인 포함)
create policy "Public profiles are viewable by everyone"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

-- 본인 프로필만 수정 가능
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 신규 가입 시 자동으로 profiles row 생성하는 함수
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at 자동 갱신 함수 및 트리거
create function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- handle_new_user()는 트리거 전용이므로 PostgREST RPC로 직접 호출되지 않도록 실행 권한 회수
revoke execute on function public.handle_new_user() from anon, authenticated, public;
