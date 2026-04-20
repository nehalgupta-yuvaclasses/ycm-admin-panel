create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null,
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.subjects
  add column if not exists "order" integer not null default 0;

alter table public.subjects
  add column if not exists updated_at timestamptz not null default now();

alter table public.subjects enable row level security;

alter table public.modules
  add column if not exists subject_id uuid;

update public.subjects
set "order" = 0
where "order" is null;

insert into public.subjects (course_id, name, "order")
select c.id, 'General', 0
from public.courses c
where not exists (
  select 1
  from public.subjects s
  where s.course_id = c.id
    and lower(s.name) = 'general'
);

update public.modules m
set subject_id = general_subject.id
from public.subjects general_subject
where m.subject_id is null
  and m.course_id = general_subject.course_id
  and lower(general_subject.name) = 'general';

update public.tests t
set subject_id = general_subject.id
from public.subjects general_subject
where t.subject_id is null
  and t.course_id = general_subject.course_id
  and lower(general_subject.name) = 'general';

alter table public.modules
  alter column subject_id set not null;

alter table public.tests
  alter column subject_id set not null;

alter table public.modules
  drop constraint if exists modules_subject_id_fkey;

alter table public.modules
  add constraint modules_subject_id_fkey foreign key (subject_id) references public.subjects(id) on delete cascade;

alter table public.tests
  drop constraint if exists tests_subject_id_fkey;

alter table public.tests
  add constraint tests_subject_id_fkey foreign key (subject_id) references public.subjects(id) on delete restrict;

create index if not exists subjects_course_id_order_idx on public.subjects (course_id, "order");
create index if not exists modules_subject_id_order_idx on public.modules (subject_id, "order");
create index if not exists tests_course_subject_idx on public.tests (course_id, subject_id);

create or replace function public.validate_module_subject_match()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.subjects as subjects
    where subjects.id = new.subject_id
  ) then
    raise exception 'Subject % does not exist', new.subject_id;
  end if;

  if new.course_id is not null and new.course_id <> (
    select subjects.course_id
    from public.subjects as subjects
    where subjects.id = new.subject_id
  ) then
    raise exception 'Module course_id must match its subject course_id';
  end if;

  new.course_id := (
    select subjects.course_id
    from public.subjects as subjects
    where subjects.id = new.subject_id
  );
  return new;
end;
$$;

drop trigger if exists modules_validate_subject_match on public.modules;
create trigger modules_validate_subject_match
before insert or update on public.modules
for each row
execute function public.validate_module_subject_match();

create or replace function public.validate_test_subject_match()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.subjects as subjects
    where subjects.id = new.subject_id
  ) then
    raise exception 'Subject % does not exist', new.subject_id;
  end if;

  if new.course_id is null then
    new.course_id := (
      select subjects.course_id
      from public.subjects as subjects
      where subjects.id = new.subject_id
    );
  elsif new.course_id <> (
    select subjects.course_id
    from public.subjects as subjects
    where subjects.id = new.subject_id
  ) then
    raise exception 'Test course_id must match its subject course_id';
  end if;

  return new;
end;
$$;

drop trigger if exists tests_validate_subject_match on public.tests;
create trigger tests_validate_subject_match
before insert or update on public.tests
for each row
execute function public.validate_test_subject_match();

create or replace function public.touch_subject_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subjects_updated_at on public.subjects;
create trigger subjects_updated_at
before update on public.subjects
for each row
execute function public.touch_subject_updated_at();

insert into storage.buckets (id, name, public)
values ('course-thumbnails', 'course-thumbnails', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'subjects' and policyname = 'Admins have full access on subjects'
  ) then
    create policy "Admins have full access on subjects"
      on public.subjects
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;

  if not exists (
    select 1
    from pg_policies
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
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'tests' and policyname = 'Admins have full access on tests'
  ) then
    create policy "Admins have full access on tests"
      on public.tests
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;
