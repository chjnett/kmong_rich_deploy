
import { Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import ProductDetailClient from "@/components/product-detail-client"
import type { Product } from "@/lib/data"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProductPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    // Fetch product data
    const { data: productData, error } = await supabase
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
        .eq('id', id)
        .single()

    if (error || !productData) {
        notFound()
    }

    // Map to UI Product Interface
    const product: Product = {
        id: productData.id,
        title: productData.name,
        category: productData.sub_categories?.categories?.name || "Uncategorized",
        subCategory: productData.sub_categories?.name || "Uncategorized",
        image: productData.img_urls?.[0] || "",
        gallery: productData.img_urls || [],
        externalUrl: productData.external_url || "",
        price: (() => {
            const priceVal = productData.specs?.price;
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
            modelNo: productData.specs?.modelNo || "",
            material: productData.specs?.material || "",
            size: productData.specs?.size || "",
            color: productData.specs?.color || ""
        },
        description: productData.description || ""
    }

    return (
        <main className="min-h-screen bg-[#000000] text-white">
            <Suspense fallback={<div>Loading...</div>}>
                <ProductDetailClient product={product} />
            </Suspense>
        </main>
    )
}
