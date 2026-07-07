insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'impact-evidence',
  'impact-evidence',
  false,
  52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.storage_object_org_id(object_name text)
returns uuid
language plpgsql
stable
as $$
declare
  folder_parts text[];
begin
  folder_parts := storage.foldername(object_name);

  if array_length(folder_parts, 1) < 1 then
    return null;
  end if;

  return folder_parts[1]::uuid;
exception
  when others then
    return null;
end;
$$;

drop policy if exists "Organization members can read evidence files" on storage.objects;
create policy "Organization members can read evidence files"
on storage.objects for select
using (
  bucket_id = 'impact-evidence'
  and public.is_org_member(public.storage_object_org_id(name))
);

drop policy if exists "Review users can upload evidence files" on storage.objects;
create policy "Review users can upload evidence files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'impact-evidence'
  and public.has_org_role(
    public.storage_object_org_id(name),
    array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]
  )
);

drop policy if exists "Review users can update evidence files" on storage.objects;
create policy "Review users can update evidence files"
on storage.objects for update
using (
  bucket_id = 'impact-evidence'
  and public.has_org_role(
    public.storage_object_org_id(name),
    array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]
  )
)
with check (
  bucket_id = 'impact-evidence'
  and public.has_org_role(
    public.storage_object_org_id(name),
    array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]
  )
);

drop policy if exists "Admins can delete evidence files" on storage.objects;
create policy "Admins can delete evidence files"
on storage.objects for delete
using (
  bucket_id = 'impact-evidence'
  and public.has_org_role(
    public.storage_object_org_id(name),
    array['owner', 'admin']::public.membership_role[]
  )
);
