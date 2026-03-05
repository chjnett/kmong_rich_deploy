import { Suspense } from "react"
import { supabase } from "@/lib/supabase" // Direct import works for public reading
import { HeroSection } from "@/components/hero-section"
import { ProductSectionClient } from "@/components/product-section-client"
import { NoticePopup } from "@/components/notice-popup"
import type { Category, Product } from "@/lib/data"
import { getVisitorStats } from "@/app/actions/visitor-actions"
import { VisitorTracker } from "@/components/visitor-tracker"

// Use ISR (Incremental Static Regeneration) - Revalidate every hour
// This significantly reduces CPU usage on Vercel
export const revalidate = 3600

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subCategory?: string }>
}) {
  // Visitor stats are still fetched on the server for initial display
  const statsPromise = getVisitorStats();

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

  // 2. Fetch Products with DB-level filtering
  let productsQuery = supabase
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

  // Apply filters at DB level if they are not "전체" (All)
  if (categoryParam !== "전체") {
    // We need to filter by the joined category name
    // In Supabase, we can use dot notation for joined tables
    productsQuery = productsQuery.filter('sub_categories.categories.name', 'eq', categoryParam)
  }

  if (subCategoryParam) {
    productsQuery = productsQuery.filter('sub_categories.name', 'eq', subCategoryParam)
  }

  const { data: productsData } = await productsQuery.order('created_at', { ascending: false })

  // 3. Client-side mapping & safety (already filtered by DB)
  const mappedProducts: Product[] = productsData?.map((p: any) => ({
    id: p.id,
    title: p.name,
    category: (p.sub_categories?.categories?.name || "Uncategorized").trim().normalize("NFC"),
    subCategory: (p.sub_categories?.name || "Uncategorized").trim().normalize("NFC"),
    image: p.img_urls?.[0] || "",
    gallery: p.img_urls || [],
    externalUrl: p.external_url || "",
    price: (() => {
      const priceVal = p.specs?.price;
      if (!priceVal) return "";
      const num = Number(String(priceVal).replace(/,/g, ''));
      if (isNaN(num)) return priceVal;
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

  let formattedProducts = mappedProducts

  const stats = await statsPromise;

  return (
    <main className="min-h-screen bg-background">
      <VisitorTracker />
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

