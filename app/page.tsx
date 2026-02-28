import { Suspense } from "react"
import { supabase } from "@/lib/supabase" // Direct import works for public reading
import { HeroSection } from "@/components/hero-section"
import { ProductSectionClient } from "@/components/product-section-client"
import { NoticePopup } from "@/components/notice-popup"
import type { Category, Product } from "@/lib/data"
import { incrementVisitor, getVisitorStats } from "@/app/actions/visitor-actions"

// Force dynamic rendering since we rely on searchParams and DB
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subCategory?: string }>
}) {
  // Increment visitor count on page load (server-side)
  // We fire-and-forget this promise so it doesn't block the page load significantly,
  // or we can await it if we want to ensure it counts before rendering.
  // Ideally, this should be inside a useEffect on client or middleware, but Server Component is the request entry.
  // NOTE: In Next.js Server Components, async operations are fine.
  incrementVisitor().catch(err => console.error("Stats tracking failed", err));

  const statsPromise = getVisitorStats(); // Start fetching concurrently

  const params = await searchParams
  const categoryParam = (params.category || "전체").normalize("NFC")
  const subCategoryParam = params.subCategory?.normalize("NFC")

  // 1. Fetch Categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*, sub_categories(name, id)') // Select sub_categories
    .order('order', { ascending: true })

  // Map to UI Category Interface
  const mappedCategories: Category[] = [
    { name: "전체", subCategories: [] },
    ...(categoriesData?.map((c: any) => ({
      name: c.name,
      subCategories: c.sub_categories?.map((s: any) => s.name) || []
    })) || [])
  ]

  // 2. Fetch Products
  // We fetch all products for now as the dataset is small. For scale, filtering should move to DB query.
  const { data: productsData } = await supabase
    .from('products')
    .select(`
        *,
        sub_categories (
            name,
            categories (
                name
            )
        )
    `)
    .order('created_at', { ascending: false })

  // Map to UI Product Interface
  const mappedProducts: Product[] = productsData?.map((p: any) => ({
    id: p.id,
    title: p.name,
    category: p.sub_categories?.categories?.name || "Uncategorized",
    subCategory: p.sub_categories?.name || "Uncategorized",
    image: p.img_urls?.[0] || "",
    gallery: p.img_urls || [],
    externalUrl: p.external_url || "",
    price: (() => {
      const priceVal = p.specs?.price;
      if (!priceVal) return "";
      // Remove commas if string
      const num = Number(String(priceVal).replace(/,/g, ''));
      if (isNaN(num)) return priceVal; // Return original string if not number (e.g. "문의")

      // Heuristic: If price is less than 10000, assume it's in thousands unit
      // This handles "1250" -> 1,250,000
      const finalPrice = num < 10000 ? num * 1000 : num;
      return `${finalPrice.toLocaleString()}원`;
    })(),
    specs: {
      modelNo: p.specs?.modelNo || "",
      material: p.specs?.material || "",
      size: p.specs?.size || "",
      color: p.specs?.color || ""
    },
    description: p.description || ""
  })) || []

  // 3. Filter Logic (Same as before)
  let formattedProducts = mappedProducts

  if (categoryParam !== "전체") {
    formattedProducts = formattedProducts.filter(p => p.category === categoryParam)
  }

  if (subCategoryParam) {
    formattedProducts = formattedProducts.filter(p => p.subCategory === subCategoryParam)
  }

  const stats = await statsPromise;

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />

      {/* Visitor Stats Display - Clean & Minimal */}
      <div className="w-full flex justify-center py-3 bg-muted/30 text-muted-foreground text-[10px] md:text-xs font-light space-x-8 border-b border-border/50">
        <span className="tracking-widest">TOTAL VISITS: <span className="text-foreground/70 font-medium">{stats.total_count.toLocaleString()}</span></span>
        <span className="tracking-widest">TODAY: <span className="text-foreground/70 font-medium">{stats.today_count.toLocaleString()}</span></span>
      </div>

      <section id="main-content" className="px-4 py-8 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <ProductSectionClient
          categories={mappedCategories}
          products={formattedProducts}
          selectedCategory={categoryParam}
          selectedSubCategory={subCategoryParam || null}
        />
      </section>

      <NoticePopup />
    </main>
  )
}

