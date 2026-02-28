-- 1. 새로운 유저가 가입할 때 자동으로 public.profiles에 행을 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. auth.users 테이블에 트리거 부착 (이미 있으면 제거 후 생성)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. [중요] 이미 가입했지만 profiles가 없는 유저들을 위한 데이터 수동 생성 (Backfill)
INSERT INTO public.profiles (id, role)
SELECT id, 'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 완료 메시지 (선택 사항, 실행 결과 확인용)
-- SELECT 'Trigger Setup and Backfill Completed' as result;
