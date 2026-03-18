-- Editorial blocks for home page cards
CREATE TABLE IF NOT EXISTS public.editorial_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '/placeholder.jpg',
  link_url TEXT NOT NULL DEFAULT '#',
  sort_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.editorial_blocks
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '/placeholder.jpg';

ALTER TABLE public.editorial_blocks
  ADD COLUMN IF NOT EXISTS link_url TEXT NOT NULL DEFAULT '#';

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_editorial_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_editorial_blocks_updated_at ON public.editorial_blocks;
CREATE TRIGGER trg_editorial_blocks_updated_at
BEFORE UPDATE ON public.editorial_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_editorial_blocks_updated_at();

ALTER TABLE public.editorial_blocks ENABLE ROW LEVEL SECURITY;

-- Allow read to everyone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'editorial_blocks'
      AND policyname = 'editorial_blocks_select_all'
  ) THEN
    CREATE POLICY editorial_blocks_select_all
      ON public.editorial_blocks
      FOR SELECT
      USING (TRUE);
  END IF;
END $$;

-- Allow authenticated users to manage rows (admin checks are handled in app routing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'editorial_blocks'
      AND policyname = 'editorial_blocks_auth_all'
  ) THEN
    CREATE POLICY editorial_blocks_auth_all
      ON public.editorial_blocks
      FOR ALL
      TO authenticated
      USING (TRUE)
      WITH CHECK (TRUE);
  END IF;
END $$;

-- Seed defaults if table is empty
INSERT INTO public.editorial_blocks (title, subtitle, body, image_url, link_url, sort_order, is_active)
SELECT * FROM (
  VALUES
    ('이번 주 큐레이션', '데일리 럭셔리 핵심 아이템', '매일 들어도 질리지 않는 컬러와 실루엣 중심으로 선별했어요.', '/placeholder.jpg', '#', 1, TRUE),
    ('베스트 3', '가장 반응 좋은 라인업', '조회수와 저장수를 기준으로 지금 가장 인기 있는 제품만 모았어요.', '/placeholder.jpg', '#', 2, TRUE),
    ('신상 한정', '빠르게 품절되는 신상', '입고 수량이 적은 제품들입니다. 늦기 전에 먼저 확인해보세요.', '/placeholder.jpg', '#', 3, TRUE)
) AS seed(title, subtitle, body, image_url, link_url, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.editorial_blocks);
