-- 사용자 이메일을 기준으로 관리자 권한을 부여하는 QUERY입니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.

-- 1. 'user@example.com'을 실제 관리자로 만들 사용자의 이메일로 변경하세요.
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@eterna.com'
);

-- 실행 후 결과가 "Success" 혹은 "Rows affected: 1" 인지 확인하세요.
