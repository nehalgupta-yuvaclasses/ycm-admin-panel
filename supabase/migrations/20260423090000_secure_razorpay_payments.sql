-- Secure Razorpay payments: normalize schema, backfill enrollments, and add a backend sync function.

alter table public.payments
  alter column status set default 'pending';

alter table public.payments
  add column if not exists razorpay_signature text;

alter table public.payments
  add column if not exists verified_at timestamptz;

alter table public.enrollments
  add column if not exists user_id uuid,
  add column if not exists payment_id uuid,
  add column if not exists payment_status text not null default 'pending',
  add column if not exists source text not null default 'web',
  add column if not exists enrolled_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists access_expires_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.enrollments e
set user_id = s.user_id
from public.students s
where e.student_id = s.id
  and e.user_id is null
  and s.user_id is not null;

update public.enrollments
set enrolled_at = coalesce(enrolled_at, created_at),
    updated_at = coalesce(updated_at, now());

update public.payments
set user_id = coalesce(user_id, student_id)
where user_id is null and student_id is not null;

update public.payments
set student_id = coalesce(student_id, user_id)
where student_id is null and user_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollments_payment_id_fkey'
  ) then
    alter table public.enrollments
      add constraint enrollments_payment_id_fkey
      foreign key (payment_id) references public.payments(id) on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollments_user_course_unique'
  ) then
    alter table public.enrollments
      add constraint enrollments_user_course_unique unique (user_id, course_id);
  end if;
end $$;

create index if not exists enrollments_user_id_idx on public.enrollments (user_id);
create index if not exists enrollments_course_id_idx on public.enrollments (course_id);
create index if not exists enrollments_user_course_idx on public.enrollments (user_id, course_id);
create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_course_id_idx on public.payments (course_id);
create index if not exists payments_status_idx on public.payments (status);

alter table public.enrollments enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'enrollments' and policyname = 'Users can read their own enrollments'
  ) then
    create policy "Users can read their own enrollments"
      on public.enrollments
      for select
      to authenticated
      using (
        auth.uid() = user_id
        or exists (
          select 1
          from public.students
          where students.id = student_id
            and students.user_id = auth.uid()
        )
        or public.is_admin()
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'enrollments' and policyname = 'Users can insert their own enrollments'
  ) then
    create policy "Users can insert their own enrollments"
      on public.enrollments
      for insert
      to authenticated
      with check (
        auth.uid() = user_id
        or exists (
          select 1
          from public.students
          where students.id = student_id
            and students.user_id = auth.uid()
        )
        or public.is_admin()
      );
  end if;
end $$;

create or replace function public.sync_razorpay_payment(
  p_user_id uuid,
  p_course_id uuid,
  p_order_id text,
  p_amount numeric,
  p_payment_id text default null,
  p_signature text default null,
  p_currency text default 'INR',
  p_provider text default 'razorpay',
  p_gst_amount numeric default 0,
  p_status text default 'pending',
  p_source text default 'web',
  p_verified_at timestamptz default null
)
returns table (
  payment_uuid uuid,
  enrollment_uuid uuid,
  payment_status text,
  enrollment_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_payment_uuid uuid;
  v_enrollment_uuid uuid;
  v_payment_status text := lower(coalesce(p_status, 'pending'));
  v_now timestamptz := coalesce(p_verified_at, now());
begin
  select id
  into v_student_id
  from public.students
  where user_id = p_user_id
  order by created_at asc
  limit 1;

  insert into public.payments (
    student_id,
    user_id,
    course_id,
    order_id,
    payment_id,
    amount,
    status,
    provider,
    currency,
    gst_amount,
    razorpay_signature,
    verified_at,
    created_at
  ) values (
    v_student_id,
    p_user_id,
    p_course_id,
    p_order_id,
    p_payment_id,
    p_amount,
    v_payment_status,
    p_provider,
    p_currency,
    p_gst_amount,
    p_signature,
    case when v_payment_status = 'success' then v_now else null end,
    v_now
  )
  on conflict (order_id) do update
    set student_id = coalesce(public.payments.student_id, excluded.student_id),
        user_id = excluded.user_id,
        course_id = excluded.course_id,
        payment_id = coalesce(excluded.payment_id, public.payments.payment_id),
        amount = excluded.amount,
        status = excluded.status,
        provider = excluded.provider,
        currency = excluded.currency,
        gst_amount = excluded.gst_amount,
        razorpay_signature = coalesce(excluded.razorpay_signature, public.payments.razorpay_signature),
        verified_at = case
          when excluded.status = 'success' then coalesce(excluded.verified_at, public.payments.verified_at, v_now)
          else public.payments.verified_at
        end,
        updated_at = now()
  returning id into v_payment_uuid;

  if v_payment_status = 'success' then
    select id
    into v_enrollment_uuid
    from public.enrollments
    where course_id = p_course_id
      and (
        user_id = p_user_id
        or (v_student_id is not null and student_id = v_student_id)
      )
    order by case when user_id = p_user_id then 0 else 1 end
    limit 1;

    if v_enrollment_uuid is null then
      insert into public.enrollments (
        student_id,
        user_id,
        course_id,
        payment_id,
        status,
        payment_status,
        enrolled_at,
        source,
        updated_at
      ) values (
        v_student_id,
        p_user_id,
        p_course_id,
        v_payment_uuid,
        'active',
        'paid',
        v_now,
        p_source,
        now()
      )
      returning id into v_enrollment_uuid;
    else
      update public.enrollments
      set student_id = coalesce(public.enrollments.student_id, v_student_id),
          user_id = coalesce(public.enrollments.user_id, p_user_id),
          payment_id = coalesce(public.enrollments.payment_id, v_payment_uuid),
          status = 'active',
          payment_status = 'paid',
          enrolled_at = coalesce(public.enrollments.enrolled_at, v_now),
          source = p_source,
          updated_at = now()
      where id = v_enrollment_uuid;
    end if;
  end if;

  return query
  select
    v_payment_uuid,
    v_enrollment_uuid,
    v_payment_status,
    case when v_payment_status = 'success' then 'active' else null end;
end;
$$;
