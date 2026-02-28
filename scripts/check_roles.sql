-- 현재 가입된 모든 유저의 이메일과 권한(Role)을 확인하는 쿼리입니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.

SELECT 
    au.email,
    p.role,
    p.id
FROM auth.users au
JOIN public.profiles p ON au.id = p.id;
