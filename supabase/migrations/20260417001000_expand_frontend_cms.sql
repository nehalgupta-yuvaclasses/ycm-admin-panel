alter table public.banners
  add column if not exists subtitle text,
  add column if not exists cta_text text,
  add column if not exists cta_link text,
  add column if not exists sort_order integer default 0;

alter table public.results
  add column if not exists result text;

alter table public.results
  add column if not exists year text;

update public.results
set year = coalesce(year, extract(year from created_at)::text)
where year is null;

create table if not exists public.homepage_content (
  id uuid not null default gen_random_uuid(),
  hero_title text not null default ''::text,
  hero_subtitle text not null default ''::text,
  primary_cta_text text not null default ''::text,
  primary_cta_link text not null default ''::text,
  secondary_cta_text text not null default ''::text,
  secondary_cta_link text not null default ''::text,
  featured_courses text[] not null default '{}'::text[],
  highlights text[] not null default '{}'::text[],
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint homepage_content_pkey primary key (id)
);

create table if not exists public.about_content (
  id uuid not null default gen_random_uuid(),
  hero_heading text not null default ''::text,
  story_content text not null default ''::text,
  founder_name text not null default ''::text,
  founder_role text not null default ''::text,
  founder_bio text not null default ''::text,
  mission text not null default ''::text,
  vision text not null default ''::text,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint about_content_pkey primary key (id)
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

drop trigger if exists homepage_content_updated_at on public.homepage_content;
create trigger homepage_content_updated_at
before update on public.homepage_content
for each row
execute function public.touch_updated_at();

drop trigger if exists about_content_updated_at on public.about_content;
create trigger about_content_updated_at
before update on public.about_content
for each row
execute function public.touch_updated_at();
