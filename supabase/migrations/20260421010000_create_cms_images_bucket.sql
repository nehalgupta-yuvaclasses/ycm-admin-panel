insert into storage.buckets (id, name, public)
values ('cms-images', 'cms-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can manage cms images bucket'
  ) then
    create policy "Admins can manage cms images bucket"
      on storage.objects
      for all
      to authenticated
      using (bucket_id = 'cms-images' and public.is_admin())
      with check (bucket_id = 'cms-images' and public.is_admin());
  end if;
end $$;
