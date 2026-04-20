alter table public.lessons
  add column if not exists is_live boolean not null default false,
  add column if not exists live_started_at timestamptz,
  add column if not exists live_ended_at timestamptz,
  add column if not exists live_by uuid references public.instructors(id) on delete set null;

update public.lessons
set is_live = false
where is_live is null;

create index if not exists lessons_is_live_idx on public.lessons (is_live);
create index if not exists lessons_live_started_at_idx on public.lessons (live_started_at desc);

create or replace function public.touch_lessons_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lessons_updated_at on public.lessons;
create trigger lessons_updated_at
before update on public.lessons
for each row
execute function public.touch_lessons_updated_at();

create or replace function public.can_manage_lesson_live_state(lesson_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  lesson_course_instructor uuid;
begin
  if public.is_admin() then
    return true;
  end if;

  select courses.instructor_id
    into lesson_course_instructor
  from public.lessons
  join public.modules on modules.id = lessons.module_id
  join public.courses on courses.id = modules.course_id
  where lessons.id = lesson_id;

  return lesson_course_instructor is not null and lesson_course_instructor = auth.uid();
end;
$$;

drop policy if exists "Instructors can update their live lessons" on public.lessons;
create policy "Instructors can update their live lessons"
  on public.lessons
  for update
  to authenticated
  using (public.can_manage_lesson_live_state(id))
  with check (public.can_manage_lesson_live_state(id));
