"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

import { Plus, Pencil, Trash2, Loader2, LogOut, FolderOpen, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import { Database } from "@/lib/database.types"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
// import { SeedButton } from "@/components/seed-button"
import { cn } from "@/lib/utils"

type ProductWithCategory = Database['public']['Tables']['products']['Row'] & {
    sub_categories: {
        categories: {
            id: number
            name: string
        } | null
    } | null
}

type Category = Database['public']['Tables']['categories']['Row']

export default function AdminDashboardPage() {
    const [products, setProducts] = useState<ProductWithCategory[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [activeCategory, setActiveCategory] = useState<string>("All")

    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    const fetchProducts = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('products')
            .select('*, sub_categories(categories(id, name))')
            .order('created_at', { ascending: false })

        if (error) {
            toast({
                variant: "destructive",
                title: "데이터 로딩 실패",
                description: error.message,
            })
        } else {
            // @ts-ignore - Supabase type inference for nested joins can be tricky
            setProducts(data || [])
        }
        setIsLoading(false)
    }

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('order', { ascending: true })

        if (data) setCategories(data)
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const filteredProducts = activeCategory === "All"
        ? products
        : products.filter(p => p.sub_categories?.categories?.name === activeCategory)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/admin/login")
    }

    const handleDelete = async (id: string) => {
        if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) {
            toast({
                variant: "destructive",
                title: "삭제 실패",
                description: error.message,
            })
        } else {
            toast({
                title: "삭제 성공",
                description: "상품이 삭제되었습니다.",
            })
            fetchProducts()
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6 lg:p-10">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-light text-[#f5f5f5]">상품 관리</h1>
                        <p className="text-[#737373]">등록된 럭셔리 상품을 관리하세요.</p>
                    </div>
                    <div className="flex gap-2">
                        {/* <SeedButton /> */}
                        <Button asChild variant="outline" className="border-[#262626] bg-transparent text-[#a3a3a3] hover:bg-[#262626] hover:text-[#f5f5f5]">
                            <Link href="/admin/dashboard/notices">
                                <Bell className="mr-2 h-4 w-4" />
                                공지사항 관리
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="border-[#262626] bg-transparent text-[#a3a3a3] hover:bg-[#262626] hover:text-[#f5f5f5]">
                            <Link href="/admin/dashboard/categories">
                                <FolderOpen className="mr-2 h-4 w-4" />
                                카테고리 관리
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleSignOut}
                            className="border-[#262626] bg-transparent text-[#a3a3a3] hover:bg-[#262626] hover:text-[#f5f5f5]"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            로그아웃
                        </Button>
                        <Button asChild className="bg-[#c9a962] text-[#000000] hover:bg-[#d4b870]">
                            <Link href="/admin/dashboard/products/new">
                                <Plus className="mr-2 h-4 w-4" />
                                상품 등록
                            </Link>
                        </Button>
                    </div>
                </div>



                {/* Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveCategory("All")}
                        className={cn(
                            "rounded-full px-4 text-sm font-medium transition-colors hover:text-[#f5f5f5]",
                            activeCategory === "All"
                                ? "bg-[#c9a962] text-[#000000] hover:bg-[#c9a962]/90 hover:text-black"
                                : "bg-[#111111] text-[#737373] hover:bg-[#262626]"
                        )}
                    >
                        전체
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant="ghost"
                            onClick={() => setActiveCategory(cat.name)}
                            className={cn(
                                "rounded-full px-4 text-sm font-medium transition-colors hover:text-[#f5f5f5]",
                                activeCategory === cat.name
                                    ? "bg-[#c9a962] text-[#000000] hover:bg-[#c9a962]/90 hover:text-black"
                                    : "bg-[#111111] text-[#737373] hover:bg-[#262626]"
                            )}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#c9a962]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group relative flex flex-col overflow-hidden rounded-lg border border-[#262626] bg-[#111111] transition-all hover:border-[#c9a962]/50"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/5] bg-[#000000]">
                                    {product.img_urls && product.img_urls[0] ? (
                                        <Image
                                            src={product.img_urls[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-[#525252]">
                                            No Image
                                        </div>
                                    )}
                                    {/* Actions Overlay (Desktop Only) */}
                                    <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                                        <Button
                                            asChild
                                            size="icon"
                                            variant="secondary"
                                            className="h-9 w-9 bg-[#f5f5f5] text-[#000000] hover:bg-[#ffffff]"
                                        >
                                            <Link href={`/admin/dashboard/products/${product.id}`}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">수정</span>
                                            </Link>
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-9 w-9"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">삭제</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex flex-1 flex-col p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="line-clamp-1 font-medium text-[#f5f5f5]">{product.name}</h3>
                                            <p className="mt-1 text-xs text-[#737373]">
                                                ID: {product.id.slice(0, 8)}...
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-[#c9a962]">
                                                {/* @ts-ignore */}
                                                {(() => {
                                                    const priceVal = product.specs?.price;
                                                    if (!priceVal) return '가격 미정';
                                                    // Remove commas if string
                                                    const num = Number(String(priceVal).replace(/,/g, ''));
                                                    if (isNaN(num)) return priceVal; // Return original string if not number (e.g. "문의")

                                                    // Heuristic: If price is less than 10000, assume it's in thousands unit
                                                    // This handles "1250" -> 1,250,000
                                                    const finalPrice = num < 10000 ? num * 1000 : num;
                                                    return `${finalPrice.toLocaleString()}원`;
                                                })()}
                                            </p>
                                        </div>
                                        {/* Mobile Actions (Visible only on mobile) */}
                                        <div className="flex gap-1 md:hidden">
                                            <Button
                                                asChild
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-[#a3a3a3] hover:text-[#f5f5f5]"
                                            >
                                                <Link href={`/admin/dashboard/products/${product.id}`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-[#a3a3a3] hover:text-red-500"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-4 text-xs text-[#525252]">
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && products.length === 0 && (
                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#262626] text-[#737373]">
                        <p className="mb-4">등록된 상품이 없습니다.</p>
                        <Button asChild variant="outline" className="border-[#262626]">
                            <Link href="/admin/dashboard/products/new">첫 상품 등록하기</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
