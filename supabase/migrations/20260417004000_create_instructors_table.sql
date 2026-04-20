create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique,
  phone text,
  bio text,
  profile_image text,
  expertise text[] not null default '{}'::text[],
  experience_years integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.instructors enable row level security;

do $$
declare
  name_expression text;
begin
  delete from public.instructors i
  using public.users u
  where u.id = i.id
    and coalesce(u.role, '') = 'admin';

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'name'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'full_name'
  ) then
    name_expression := 'coalesce(u.name, u.full_name, u.email)';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'name'
  ) then
    name_expression := 'coalesce(u.name, u.email)';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'full_name'
  ) then
    name_expression := 'coalesce(u.full_name, u.email)';
  else
    name_expression := 'u.email';
  end if;

  execute format($sql$
    insert into public.instructors (
      id,
      full_name,
      email,
      phone,
      bio,
      profile_image,
      expertise,
      experience_years,
      is_active,
      created_at,
      updated_at
    )
    select
      u.id,
      %s,
      u.email,
      null,
      null,
      null,
      '{}'::text[],
      0,
      true,
      now(),
      now()
    from public.users u
    where coalesce(u.role, '') <> 'admin'
    on conflict (id) do update
    set
      full_name = excluded.full_name,
      email = excluded.email,
      updated_at = now();
  $sql$, name_expression);
end $$;

alter table public.courses
  drop constraint if exists courses_instructor_id_fkey;

alter table public.courses
  add constraint courses_instructor_id_fkey
  foreign key (instructor_id)
  references public.instructors(id)
  on delete set null;

create or replace function public.touch_instructors_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists instructors_updated_at on public.instructors;
create trigger instructors_updated_at
before update on public.instructors
for each row
execute function public.touch_instructors_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'instructors' and policyname = 'Admins have full access on instructors'
  ) then
    create policy "Admins have full access on instructors"
      on public.instructors
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;
