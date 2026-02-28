"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { CategoryNav } from "@/components/category-nav"
import { ProductGrid } from "@/components/product-grid"
import type { Category, Product } from "@/lib/data"

interface ProductSectionClientProps {
    categories: Category[]
    products: Product[]
    selectedCategory: string
    selectedSubCategory: string | null
}

export function ProductSectionClient({
    categories,
    products,
    selectedCategory,
    selectedSubCategory,
}: ProductSectionClientProps) {
    const [searchQuery, setSearchQuery] = useState("")

    // Filter by search query
    const filteredProducts = products.filter((product) => {
        if (!searchQuery) return true

        const query = searchQuery.toLowerCase()
        return (
            product.title.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.specs?.modelNo?.toLowerCase().includes(query)
        )
    })

    return (
        <>
            {/* Search Bar - Minimalist Redesign */}
            <div className="mb-12 flex justify-center pt-4">
                <div className="relative w-full max-w-4xl">
                    <Search className="absolute left-6 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="상품 검색..."
                        className="w-full rounded-md border-none bg-muted/60 py-4 pl-14 pr-12 text-base text-foreground placeholder:text-muted-foreground/50 focus:bg-muted/80 focus:outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Category Navigation */}
            <CategoryNav
                categories={categories}
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
            />

            {/* Product Grid */}
            <ProductGrid products={filteredProducts} />
        </>
    )
}
