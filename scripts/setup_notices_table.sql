-- 공지사항 테이블 생성
CREATE TABLE notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 설정
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 (공개)
CREATE POLICY "Anyone can view active notices"
  ON notices FOR SELECT
  USING (is_active = true);

-- 인증된 사용자만 수정 가능 (관리자)
CREATE POLICY "Authenticated users can manage notices"
  ON notices FOR ALL
  USING (auth.role() = 'authenticated');

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
