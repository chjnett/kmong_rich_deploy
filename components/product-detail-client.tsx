"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Share2, Heart, X } from "lucide-react"
import type { Product } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { OrderDialog } from "@/components/order-dialog"

export default function ProductDetailClient({ product }: { product: Product }) {
    const router = useRouter()
    const [isWishlisted, setIsWishlisted] = useState(false)

    const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image]

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.title,
                    text: `RICH - ${product.title}`,
                    url: product.externalUrl || window.location.href,
                })
            } catch {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(window.location.href)
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-background lg:flex-row">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-foreground backdrop-blur-md transition-colors hover:bg-muted border border-border/10 shadow-sm"
            >
                <X className="h-5 w-5" />
            </button>

            {/* 1. Image Section (Vertical Scroll Gallery) */}
            <div className="w-full lg:w-[60%] bg-muted/5 flex flex-col gap-1 md:gap-2">
                {gallery.map((url, index) => (
                    <div key={index} className="w-full overflow-hidden bg-white flex items-center justify-center">
                        <img
                            src={url || "/placeholder.svg"}
                            alt={`${product.title} - view ${index + 1}`}
                            className="w-full h-auto object-contain max-h-[120svh]"
                            loading={index === 0 ? "eager" : "lazy"}
                        />
                    </div>
                ))}
            </div>

            {/* 2. Content Section (Sticky) */}
            <div className="flex-1 bg-background px-6 py-10 lg:sticky lg:top-0 lg:h-screen lg:flex lg:items-center lg:px-16 lg:py-0">
                <div className="mx-auto w-full max-w-xl space-y-10">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold tracking-[0.15em] text-muted-foreground/60 uppercase">
                                {product.category} · {product.subCategory}
                            </p>
                            <div className="flex gap-4">
                                <button onClick={handleShare} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <Share2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => setIsWishlisted(!isWishlisted)} className={isWishlisted ? "text-foreground" : "text-muted-foreground hover:text-foreground transition-colors"}>
                                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                                </button>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground lg:text-5xl text-balance leading-[1.15] tracking-tight">
                            {product.title}
                        </h1>
                    </div>

                    {/* Price Display */}
                    {product.price && (
                        <div className="flex items-center gap-3 py-2 border-y border-border/40">
                            <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                Price
                            </span>
                            <span className="text-2xl font-bold text-foreground md:text-3xl tracking-tighter">
                                {product.price}
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Description</h3>
                        <p className="text-[14px] leading-7 text-muted-foreground whitespace-pre-wrap font-medium">
                            {product.description}
                        </p>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-6">
                        <OrderDialog
                            productName={product.title}
                            trigger={
                                <button
                                    className="flex h-14 w-full items-center justify-center bg-black px-4 text-[12px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-zinc-800"
                                >
                                    주문하기
                                </button>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
