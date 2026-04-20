alter table public.courses
  add column if not exists subtitle text default ''::text,
  add column if not exists category text default 'General'::text,
  add column if not exists instructor_id uuid references public.users(id) on delete set null,
  add column if not exists visibility text not null default 'Public',
  add column if not exists updated_at timestamptz not null default now();

alter table public.courses
  drop constraint if exists courses_status_check;

alter table public.courses
  add constraint courses_status_check check (status in ('Draft', 'Published'));

update public.courses
set status = 'Draft'
where status is null
   or lower(status) not in ('draft', 'published');

update public.courses
set status = 'Draft'
where status = 'draft';

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  lesson_type text not null default 'recorded',
  video_url text,
  live_url text,
  scheduled_at timestamptz,
  notes text,
  duration text,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lessons
  add column if not exists lesson_type text not null default 'recorded',
  add column if not exists live_url text,
  add column if not exists scheduled_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'lessons_lesson_type_check'
  ) then
    alter table public.lessons
      add constraint lessons_lesson_type_check check (lesson_type in ('recorded', 'live'));
  end if;
end $$;

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress_percent numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_user_course_unique unique (user_id, course_id)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'modules' and policyname = 'Admins have full access on modules'
  ) then
    create policy "Admins have full access on modules"
      on public.modules
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lessons' and policyname = 'Admins have full access on lessons'
  ) then
    create policy "Admins have full access on lessons"
      on public.lessons
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'enrollments' and policyname = 'Admins have full access on enrollments'
  ) then
    create policy "Admins have full access on enrollments"
      on public.enrollments
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('course-thumbnails', 'course-thumbnails', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can manage course thumbnails'
  ) then
    create policy "Admins can manage course thumbnails"
      on storage.objects
      for all
      to authenticated
      using (bucket_id = 'course-thumbnails' and public.is_admin())
      with check (bucket_id = 'course-thumbnails' and public.is_admin());
  end if;
end $$;

create or replace function public.touch_course_related_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists modules_updated_at on public.modules;
create trigger modules_updated_at
before update on public.modules
for each row
execute function public.touch_course_related_updated_at();

drop trigger if exists lessons_updated_at on public.lessons;
create trigger lessons_updated_at
before update on public.lessons
for each row
execute function public.touch_course_related_updated_at();

drop trigger if exists enrollments_updated_at on public.enrollments;
create trigger enrollments_updated_at
before update on public.enrollments
for each row
execute function public.touch_course_related_updated_at();

drop trigger if exists courses_updated_at on public.courses;
create trigger courses_updated_at
before update on public.courses
for each row
execute function public.touch_updated_at();