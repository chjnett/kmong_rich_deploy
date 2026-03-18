"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { CategoryNav } from "@/components/category-nav"
import { ProductGrid } from "@/components/product-grid"
import type { Category, Product } from "@/lib/data"
import { supabase } from "@/lib/supabase"

interface ProductSectionClientProps {
  categories: Category[]
  products: Product[]
  selectedCategory: string
  selectedSubCategory: string | null
  searchQuery: string
}

interface EditorialCard {
  id?: string
  title: string
  subtitle: string
  body: string
  image_url?: string | null
  link_url?: string | null
}

const editorialCards = [
  {
    id: "default-1",
    title: "이번 주 큐레이션",
    subtitle: "데일리 럭셔리 핵심 아이템",
    body: "매일 들어도 질리지 않는 컬러와 실루엣 중심으로 선별했어요.",
    image_url: "/placeholder.jpg",
    link_url: "",
  },
  {
    id: "default-2",
    title: "베스트 3",
    subtitle: "가장 반응 좋은 라인업",
    body: "조회수와 저장수를 기준으로 지금 가장 인기 있는 제품만 모았어요.",
    image_url: "/placeholder.jpg",
    link_url: "",
  },
  {
    id: "default-3",
    title: "신상 한정",
    subtitle: "빠르게 품절되는 신상",
    body: "입고 수량이 적은 제품들입니다. 늦기 전에 먼저 확인해보세요.",
    image_url: "/placeholder.jpg",
    link_url: "",
  },
]

interface EditorialBlock {
  id: string
  title: string
  subtitle: string
  body: string
  image_url?: string | null
  link_url?: string | null
  sort_order: number
  is_active: boolean
}

export function ProductSectionClient({
  categories,
  products,
  selectedCategory,
  selectedSubCategory,
  searchQuery,
}: ProductSectionClientProps) {
  const [mobileSubSelections, setMobileSubSelections] = useState<Record<string, string>>({})
  const [editorialItems, setEditorialItems] = useState<EditorialCard[]>(editorialCards)
  const mobileSectionRef = useRef<HTMLDivElement | null>(null)

  const safeSrc = (src?: string) => (src?.trim() ? src : "/placeholder.svg")
  const normalizeLabel = (value: string) => value.trim().normalize("NFC")
  const resolveEditorialHref = (card: EditorialCard) => {
    const rawLink = card.link_url?.trim()

    if (rawLink && rawLink !== "#") {
      if (rawLink.startsWith("/") || rawLink.startsWith("http://") || rawLink.startsWith("https://")) {
        return rawLink
      }

      return `/${rawLink.replace(/^\/+/, "")}`
    }

    if (card.id) {
      return `/editorial/${encodeURIComponent(card.id)}`
    }

    return "/editorial"
  }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          product.title.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.specs?.modelNo?.toLowerCase().includes(query)
        )
      }),
    [products, searchQuery]
  )

  const displayProducts = searchQuery && filteredProducts.length === 0 ? products : filteredProducts

  const categoryNamesFromDb = categories
    .map((category) => normalizeLabel(category.name))
    .filter((name) => name && name !== "전체")

  const categoryNamesFromProducts = Array.from(
    new Set(displayProducts.map((product) => normalizeLabel(product.category)).filter(Boolean))
  )

  const orderedCategoryNames = [
    ...categoryNamesFromDb,
    ...categoryNamesFromProducts.filter((name) => !categoryNamesFromDb.includes(name)),
  ]

  const getSubOptions = (categoryName: string, items: Product[]) => {
    const fromDb =
      categories
        .find((cat) => normalizeLabel(cat.name) === categoryName)
        ?.subCategories?.map((sub) => normalizeLabel(sub))
        .filter(Boolean) || []

    const fromItems = Array.from(new Set(items.map((item) => normalizeLabel(item.subCategory)).filter(Boolean)))

    const merged = [...fromDb, ...fromItems.filter((sub) => !fromDb.includes(sub))]
    return ["전체", ...merged]
  }

  const categorizedProducts = orderedCategoryNames
    .map((categoryName) => ({
      categoryName,
      items: displayProducts.filter((product) => normalizeLabel(product.category) === categoryName),
    }))
    .filter((entry) => entry.items.length > 0)

  useEffect(() => {
    const fetchEditorialBlocks = async () => {
      const { data, error } = await supabase
        .from("editorial_blocks")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (error || !data || data.length === 0) return

      const mapped = (data as EditorialBlock[]).map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        body: item.body,
        image_url: item.image_url || "/placeholder.jpg",
        link_url: item.link_url || "",
      }))

      setEditorialItems(mapped)
    }

    fetchEditorialBlocks()
  }, [])

  useEffect(() => {
    const root = mobileSectionRef.current
    if (!root || typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let isPaused = false
    let resumeTimer: ReturnType<typeof setTimeout> | null = null
    const scrollers = Array.from(
      root.querySelectorAll<HTMLElement>('[data-auto-scroll-products="true"]')
    )

    if (scrollers.length === 0) return

    const pauseAutoScroll = () => {
      isPaused = true
      if (resumeTimer) clearTimeout(resumeTimer)
      resumeTimer = setTimeout(() => {
        isPaused = false
      }, 5000)
    }

    const tick = () => {
      if (isPaused) return

      scrollers.forEach((scroller) => {
        if (scroller.scrollWidth <= scroller.clientWidth + 8) return

        const maxLeft = scroller.scrollWidth - scroller.clientWidth
        const nextLeft = scroller.scrollLeft + 132

        if (nextLeft >= maxLeft - 4) {
          scroller.scrollTo({ left: 0, behavior: "smooth" })
          return
        }

        scroller.scrollBy({ left: 132, behavior: "smooth" })
      })
    }

    const intervalId = window.setInterval(tick, 2600)

    scrollers.forEach((scroller) => {
      scroller.addEventListener("touchstart", pauseAutoScroll, { passive: true })
      scroller.addEventListener("pointerdown", pauseAutoScroll)
      scroller.addEventListener("wheel", pauseAutoScroll, { passive: true })
    })

    return () => {
      window.clearInterval(intervalId)
      if (resumeTimer) clearTimeout(resumeTimer)
      scrollers.forEach((scroller) => {
        scroller.removeEventListener("touchstart", pauseAutoScroll)
        scroller.removeEventListener("pointerdown", pauseAutoScroll)
        scroller.removeEventListener("wheel", pauseAutoScroll)
      })
    }
  }, [displayProducts.length, categories.length, searchQuery])

  return (
    <>
      <div ref={mobileSectionRef} className="space-y-9 md:hidden">
        <section className="space-y-3">
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground">EDITORIAL</p>
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
            {editorialItems.map((card) => (
              <Link
                key={card.id || `${card.title}-${card.subtitle}`}
                href={resolveEditorialHref(card)}
                className="group min-w-[284px] max-w-[284px] snap-start overflow-hidden rounded-md border border-border/60 bg-white"
              >
                <div className="relative h-[152px] overflow-hidden bg-muted/20">
                  <img
                    src={card.image_url || "/placeholder.jpg"}
                    alt={card.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-active:scale-[0.98]"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg"
                    }}
                  />
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-[10px] tracking-[0.16em] text-muted-foreground">{card.subtitle}</p>
                  <h3 className="line-clamp-1 text-[19px] font-semibold leading-tight tracking-tight text-foreground">{card.title}</h3>
                  <p className="line-clamp-2 text-[12px] leading-5 text-muted-foreground">{card.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {categorizedProducts.map(({ categoryName, items }) => {
          const subOptions = getSubOptions(categoryName, items)
          const selectedSub = mobileSubSelections[categoryName] || "전체"
          const visibleItems =
            selectedSub === "전체"
              ? items
              : items.filter((item) => normalizeLabel(item.subCategory) === selectedSub)

          return (
            <section
              id={`mobile-cat-${encodeURIComponent(categoryName)}`}
              key={categoryName}
              className="space-y-3 scroll-mt-[132px]"
            >
              <div className="flex items-end justify-between px-0.5">
                <h3 className="text-[18px] font-semibold tracking-tight text-foreground">{categoryName}</h3>
                <span className="text-[11px] text-muted-foreground">{visibleItems.length} items</span>
              </div>

              {subOptions.length > 1 && (
                <div className="-mx-4 overflow-x-auto px-4 pb-1">
                  <div className="inline-flex items-center gap-2">
                    {subOptions.map((sub) => {
                      const active = selectedSub === sub
                      return (
                        <button
                          key={`${categoryName}-${sub}`}
                          onClick={() =>
                            setMobileSubSelections((prev) => ({
                              ...prev,
                              [categoryName]: sub,
                            }))
                          }
                          className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-[12px] leading-none transition-all ${
                            active
                              ? "bg-foreground text-background"
                              : "border border-border/60 bg-white text-muted-foreground"
                          }`}
                        >
                          {sub}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div
                data-auto-scroll-products="true"
                className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
              >
                {visibleItems.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group grid h-[346px] min-w-[196px] max-w-[196px] flex-none snap-start grid-rows-[244px_102px] overflow-hidden rounded-sm border border-border/40 bg-white"
                  >
                    <div className="relative h-[244px] overflow-hidden bg-muted/20">
                      <img
                        src={safeSrc(product.image)}
                        alt={product.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>

                    <div className="grid h-[102px] grid-rows-[16px_40px_22px] content-start gap-[6px] px-2 pt-2 box-border">
                      <p className="truncate text-[11px] leading-4 text-muted-foreground">{product.subCategory}</p>
                      <h4 className="overflow-hidden text-[13px] font-medium leading-5 text-foreground">
                        <span className="line-clamp-2 break-words">{product.title}</span>
                      </h4>
                      <p className="truncate text-[15px] font-semibold leading-[22px] text-foreground">{product.price || "\u00A0"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        {searchQuery && filteredProducts.length === 0 && (
          <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            검색 결과가 없어 전체 상품을 보여주고 있습니다.
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
        />
        <ProductGrid products={displayProducts} />
      </div>
    </>
  )
}
