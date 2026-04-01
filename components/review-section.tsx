"use client"

import { useEffect, useState, useRef } from "react"
import { Star } from "lucide-react"

interface Review {
    id: string
    author_name: string
    content: string
    rating: number
    image_url: string | null
    created_at: string
}

export function ReviewSection({ reviews }: { reviews: Review[] }) {
    const [isMounted, setIsMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ""
        const d = new Date(dateStr)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}. ${month}. ${day}.`
    }

    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    if (!reviews || reviews.length === 0) return null

    return (
        <section className="space-y-3 py-4">
            <div className="flex items-center justify-between px-1">
                <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase font-semibold">
                    Customer Reviews
                </p>
                <div className="h-[1px] flex-1 bg-border/40 mx-4 hidden md:block"></div>
            </div>

            <div
                data-auto-scroll="true"
                data-scroll-step="296"
                className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
            >
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="group min-w-[284px] max-w-[284px] snap-start overflow-hidden rounded-md border border-border/60 bg-white shadow-sm transition-all hover:shadow-md h-fit"
                    >
                        {/* Image Block - Editorial Style */}
                        <div className="relative h-[152px] overflow-hidden bg-muted/20">
                            {review.image_url ? (
                                <img
                                    src={review.image_url}
                                    alt="Review photo"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-50 p-6 text-center">
                                    <div className="flex gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted/20"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em]">Verified Purchase</p>
                                </div>
                            )}
                            {/* Floating Stars if image exists */}
                            {review.image_url && (
                                <div className="absolute bottom-2 left-2 flex gap-0.5 rounded-full bg-white/80 px-2 py-1 backdrop-blur-sm">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-2.5 w-2.5 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-300"}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Block - Editorial Style */}
                        <div className="space-y-1.5 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] tracking-[0.12em] text-muted-foreground font-bold uppercase">
                                    {review.author_name}
                                </p>
                                <p className="text-[9px] text-muted-foreground/50">
                                    {isMounted ? formatDate(review.created_at) : ""}
                                </p>
                            </div>
                            <h3 className={`text-[15px] font-semibold leading-tight tracking-tight text-foreground min-h-[40px] whitespace-pre-wrap ${!expandedIds[review.id] ? "line-clamp-2" : ""}`}>
                                {review.content}
                            </h3>
                            <div className="pt-2">
                                <span
                                    onClick={() => toggleExpand(review.id)}
                                    className="inline-block text-[10px] font-bold text-black border-b border-black uppercase tracking-widest pb-0.5 cursor-pointer hover:opacity-70"
                                >
                                    {expandedIds[review.id] ? "Close" : "Read more"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
