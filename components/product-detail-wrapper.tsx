"use client"

import { useState } from "react"
import { ProductGrid } from "@/components/product-grid"
import { ProductDetail } from "@/components/product-detail"
import type { Product } from "@/lib/data"

interface ProductDetailWrapperProps {
    products: Product[]
}

export function ProductDetailWrapper({ products }: ProductDetailWrapperProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product)
        setIsModalOpen(true)
    }

    return (
        <>
            <ProductGrid
                products={products}
                onProductClick={handleProductClick}
            />

            <ProductDetail
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isAdmin={false} // Will need to be dynamic later
            />
        </>
    )
}
