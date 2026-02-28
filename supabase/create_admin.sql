-- 오류 원인: 'id' 컬럼은 이메일이 아닌 UUID 형식(예: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)이어야 합니다.

-- 1. Supabase Dashboard > Authentication > Users 메뉴로 이동하세요.
-- 2. 생성한 이메일(eterna@gmail.com) 옆의 'User UID' 컬럼에 있는 값을 복사하세요.
--    (값은 보통 숫자와 알파벳이 섞인 긴 문자열입니다)
-- 3. 아래 쿼리의 따옴표 안에 복사한 UID를 붙여넣고 실행하세요.

INSERT INTO public.profiles (id, role)
VALUES ('여기에_복사한_UID를_넣으세요', 'admin')
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- 예시:
-- VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin')
