-- 1. 'product-images' 버킷 생성
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. 정책 설정을 위해 RLS 활성화 (일반적으로 buckets 테이블은 이미 활성화되어 있음)
-- 3. 스토리지 정책 설정 (모든 사용자가 보기 가능, 인증된 사용자만 업로드/수정/삭제 가능)

-- 읽기 정책 (누구나 가능)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- 업로드 정책 (인증된 관리자만 가능하도록 설정하거나, 편의상 로그인된 모든 유저 허용)
-- 여기서는 authenticated(로그인한) 사용자에게 허용합니다. (Admin 체크까지 포함하면 더 좋음)
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

create policy "Authenticated users can update"
  on storage.objects for update
  using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete"
  on storage.objects for delete
  using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );
