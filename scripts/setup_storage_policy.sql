-- Storage의 'product-images' 버킷에 대한 접근 권한(RLS)을 설정하는 스크립트입니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.

-- 1. 기존 정책이 있다면 충돌 방지를 위해 삭제
DROP POLICY IF EXISTS "Public Access to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete on product-images" ON storage.objects;

-- 2. 새 정책 생성: 'product-images' 버킷에 대해 읽기/쓰기/삭제 모든 권한 허용 (Public)
-- 주의: 실제 서비스 운영 시에는 Insert/Delete 권한을 authenticated 유저로 제한하는 것이 좋습니다.
-- 현재는 마이그레이션 편의를 위해 전체 허용합니다.

CREATE POLICY "Public Access to product-images"
ON storage.objects FOR ALL
USING ( bucket_id = 'product-images' )
WITH CHECK ( bucket_id = 'product-images' );

-- 완료 메시지
-- SELECT 'Storage Policy Updated' as result;
