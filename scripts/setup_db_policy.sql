    -- DB 테이블(categories, sub_categories, products)에 대한 접근 권한(RLS)을 설정하는 스크립트입니다.
    -- Supabase Dashboard > SQL Editor에서 실행하세요.

    -- 1. 기존 정책 제거 (충돌 방지)
    DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
    DROP POLICY IF EXISTS "Enable insert for all users" ON categories;
    DROP POLICY IF EXISTS "Enable read access for all users" ON sub_categories;
    DROP POLICY IF EXISTS "Enable insert for all users" ON sub_categories;
    DROP POLICY IF EXISTS "Enable read access for all users" ON products;
    DROP POLICY IF EXISTS "Enable insert for all users" ON products;
    DROP POLICY IF EXISTS "Enable update for all users" ON products;

    -- 2. 전체 허용 정책 생성 (Public)
    -- 주의: 마이그레이션을 위해 INSERT/UPDATE를 허용합니다.
    -- 서비스 오픈 시에는 관리자(Admin)만 쓰기가 가능하도록 수정하는 것이 좋습니다.

    -- Categories
    CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
    CREATE POLICY "Enable insert for all users" ON categories FOR INSERT WITH CHECK (true);

    -- Sub Categories
    CREATE POLICY "Enable read access for all users" ON sub_categories FOR SELECT USING (true);
    CREATE POLICY "Enable insert for all users" ON sub_categories FOR INSERT WITH CHECK (true);

    -- Products
    CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
    CREATE POLICY "Enable insert for all users" ON products FOR INSERT WITH CHECK (true);
    CREATE POLICY "Enable update for all users" ON products FOR UPDATE USING (true) WITH CHECK (true);

    -- 완료 메시지
    -- SELECT 'Database Policy Updated' as result;
