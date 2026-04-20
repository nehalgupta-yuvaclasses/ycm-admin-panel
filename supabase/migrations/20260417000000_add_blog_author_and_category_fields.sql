alter table public.blogs
  add column if not exists category text default 'General'::text,
  add column if not exists author_name text,
  add column if not exists author_role text,
  add column if not exists author_avatar_url text,
  add column if not exists author_bio text;

update public.blogs
set category = coalesce(category, 'General')
where category is null;
