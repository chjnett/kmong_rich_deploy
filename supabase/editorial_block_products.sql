-- Link products to editorial blocks
CREATE TABLE IF NOT EXISTS public.editorial_block_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  editorial_block_id UUID NOT NULL REFERENCES public.editorial_blocks(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (editorial_block_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_editorial_block_products_block
  ON public.editorial_block_products(editorial_block_id, sort_order);

ALTER TABLE public.editorial_block_products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'editorial_block_products'
      AND policyname = 'editorial_block_products_select_all'
  ) THEN
    CREATE POLICY editorial_block_products_select_all
      ON public.editorial_block_products
      FOR SELECT
      USING (TRUE);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'editorial_block_products'
      AND policyname = 'editorial_block_products_auth_all'
  ) THEN
    CREATE POLICY editorial_block_products_auth_all
      ON public.editorial_block_products
      FOR ALL
      TO authenticated
      USING (TRUE)
      WITH CHECK (TRUE);
  END IF;
END $$;
