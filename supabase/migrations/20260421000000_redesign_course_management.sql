alter table public.courses
  add column if not exists course_type text not null default 'Hybrid',
  add column if not exists lifecycle_stage text not null default 'Draft',
  add column if not exists access_mode text not null default 'Open',
  add column if not exists enrollment_mode text not null default 'SelfEnroll',
  add column if not exists drip_enabled boolean not null default false,
  add column if not exists drip_mode text not null default 'Sequential',
  add column if not exists drip_interval_days integer not null default 7,
  add column if not exists certificate_enabled boolean not null default false,
  add column if not exists certificate_template text default ''::text,
  add column if not exists analytics_enabled boolean not null default true,
  add column if not exists analytics_event_key text default ''::text,
  add column if not exists brand_color text not null default '#111827'::text,
  add column if not exists cover_image_url text default ''::text,
  add column if not exists publish_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists assessment_mode text not null default 'PerSubject',
  add column if not exists assessment_notes text default ''::text,
  add column if not exists completion_threshold numeric(5,2) not null default 80;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'courses_course_type_check'
  ) then
    alter table public.courses
      add constraint courses_course_type_check check (course_type in ('Live', 'Recorded', 'Hybrid'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'courses_lifecycle_stage_check'
  ) then
    alter table public.courses
      add constraint courses_lifecycle_stage_check check (lifecycle_stage in ('Draft', 'Review', 'Published', 'Archived'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'courses_access_mode_check'
  ) then
    alter table public.courses
      add constraint courses_access_mode_check check (access_mode in ('Open', 'InviteOnly', 'Approval'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'courses_enrollment_mode_check'
  ) then
    alter table public.courses
      add constraint courses_enrollment_mode_check check (enrollment_mode in ('SelfEnroll', 'Manual', 'Cohort'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'courses_drip_mode_check'
  ) then
    alter table public.courses
      add constraint courses_drip_mode_check check (drip_mode in ('Immediate', 'Scheduled', 'Sequential'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'courses_assessment_mode_check'
  ) then
    alter table public.courses
      add constraint courses_assessment_mode_check check (assessment_mode in ('None', 'PerSubject', 'PerModule', 'PerLesson'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'courses_drip_interval_days_check'
  ) then
    alter table public.courses
      add constraint courses_drip_interval_days_check check (drip_interval_days >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'courses_completion_threshold_check'
  ) then
    alter table public.courses
      add constraint courses_completion_threshold_check check (completion_threshold >= 0 and completion_threshold <= 100);
  end if;
end $$;

alter table public.subjects
  add column if not exists description text default ''::text;

alter table public.modules
  add column if not exists module_type text not null default 'content',
  add column if not exists drip_days_after_subject integer not null default 0,
  add column if not exists unlock_after_module_id uuid;

alter table public.lessons
  add column if not exists content_type text not null default 'recorded',
  add column if not exists resource_url text,
  add column if not exists is_preview boolean not null default false,
  add column if not exists unlock_after_days integer not null default 0,
  add column if not exists assessment_test_id uuid,
  add column if not exists completion_required boolean not null default true,
  add column if not exists published_at timestamptz;

create table if not exists public.course_instructors (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  role text not null default 'co_instructor',
  is_primary boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_instructors_course_instructor_unique unique (course_id, instructor_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'course_instructors_role_check'
  ) then
    alter table public.course_instructors
      add constraint course_instructors_role_check check (role in ('lead', 'co_instructor', 'assistant'));
  end if;
end $$;

alter table public.enrollments
  add column if not exists status text not null default 'active',
  add column if not exists enrolled_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists payment_status text not null default 'pending',
  add column if not exists source text not null default 'web',
  add column if not exists access_expires_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'enrollments_status_check'
  ) then
    alter table public.enrollments
      add constraint enrollments_status_check check (status in ('active', 'paused', 'completed', 'cancelled'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'enrollments_payment_status_check'
  ) then
    alter table public.enrollments
      add constraint enrollments_payment_status_check check (payment_status in ('pending', 'paid', 'failed', 'refunded'));
  end if;
end $$;

alter table public.tests
  add column if not exists module_id uuid,
  add column if not exists lesson_id uuid,
  add column if not exists assessment_kind text not null default 'quiz',
  add column if not exists attempt_limit integer not null default 1,
  add column if not exists passing_marks numeric(5,2) not null default 40,
  add column if not exists duration_minutes integer,
  add column if not exists instructions text default ''::text,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tests_assessment_kind_check'
  ) then
    alter table public.tests
      add constraint tests_assessment_kind_check check (assessment_kind in ('quiz', 'assignment', 'mock', 'exam'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'tests_status_check'
  ) then
    alter table public.tests
      add constraint tests_status_check check (status in ('draft', 'published', 'archived'));
  end if;
end $$;

alter table public.modules
  drop constraint if exists modules_unlock_after_module_id_fkey;

alter table public.modules
  add constraint modules_unlock_after_module_id_fkey foreign key (unlock_after_module_id) references public.modules(id) on delete set null;

alter table public.lessons
  drop constraint if exists lessons_assessment_test_id_fkey;

alter table public.lessons
  add constraint lessons_assessment_test_id_fkey foreign key (assessment_test_id) references public.tests(id) on delete set null;

alter table public.tests
  drop constraint if exists tests_module_id_fkey;

alter table public.tests
  add constraint tests_module_id_fkey foreign key (module_id) references public.modules(id) on delete set null;

alter table public.tests
  drop constraint if exists tests_lesson_id_fkey;

alter table public.tests
  add constraint tests_lesson_id_fkey foreign key (lesson_id) references public.lessons(id) on delete set null;

create index if not exists courses_lifecycle_stage_idx on public.courses (lifecycle_stage);
create index if not exists courses_course_type_idx on public.courses (course_type);
create index if not exists courses_access_mode_idx on public.courses (access_mode);
create index if not exists courses_enrollment_mode_idx on public.courses (enrollment_mode);
create index if not exists courses_publish_at_idx on public.courses (publish_at);
create index if not exists course_instructors_course_id_idx on public.course_instructors (course_id, display_order);
create index if not exists course_instructors_instructor_id_idx on public.course_instructors (instructor_id);
create index if not exists subjects_course_id_order_idx on public.subjects (course_id, "order");
create index if not exists modules_subject_id_order_idx on public.modules (subject_id, "order");
create index if not exists lessons_module_id_order_idx on public.lessons (module_id, "order");
create index if not exists tests_course_subject_idx on public.tests (course_id, subject_id);
create index if not exists tests_module_id_idx on public.tests (module_id);
create index if not exists tests_lesson_id_idx on public.tests (lesson_id);
create index if not exists enrollments_course_status_idx on public.enrollments (course_id, status);

alter table public.course_instructors enable row level security;
alter table public.subjects enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.tests enable row level security;
alter table public.enrollments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'course_instructors' and policyname = 'Admins have full access on course instructors'
  ) then
    create policy "Admins have full access on course instructors"
      on public.course_instructors
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
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

create or replace function public.validate_test_relationships()
returns trigger
language plpgsql
as $$
declare
  module_course_id uuid;
  lesson_module_id uuid;
begin
  if new.module_id is not null then
    select course_id into module_course_id from public.modules where id = new.module_id;
    if module_course_id is null then
      raise exception 'Module % does not exist', new.module_id;
    end if;

    if new.course_id is null then
      new.course_id := module_course_id;
    elsif new.course_id <> module_course_id then
      raise exception 'Test course_id must match its module course_id';
    end if;
  end if;

  if new.lesson_id is not null then
    select module_id into lesson_module_id from public.lessons where id = new.lesson_id;
    if lesson_module_id is null then
      raise exception 'Lesson % does not exist', new.lesson_id;
    end if;

    if new.module_id is null then
      new.module_id := lesson_module_id;
    elsif new.module_id <> lesson_module_id then
      raise exception 'Test lesson_id must match its module_id';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tests_validate_relationships on public.tests;
create trigger tests_validate_relationships
before insert or update on public.tests
for each row
execute function public.validate_test_relationships();

create or replace function public.touch_course_instructor_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists course_instructors_updated_at on public.course_instructors;
create trigger course_instructors_updated_at
before update on public.course_instructors
for each row
execute function public.touch_course_instructor_updated_at();
