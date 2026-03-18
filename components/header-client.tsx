"use client"

import Link from "next/link"
import { Search, X, ShoppingBag } from "lucide-react"
import type { Category } from "@/lib/data"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

export function HeaderClient({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
    setSearchQuery("")
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur-md">
      <div className="relative mx-auto flex h-[58px] max-w-[2000px] items-center px-4 md:h-[68px] md:px-8">
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 stroke-[1.6]" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="6" x2="20" y2="6" />
                <line x1="2" y1="12" x2="20" y2="12" />
                <line x1="2" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
          <button className="p-1.5 text-foreground" onClick={() => setSearchOpen(true)} aria-label="검색">
            <Search className="h-[19px] w-[19px] stroke-[1.6]" />
          </button>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[28px] leading-none tracking-tight text-[#1a1a1a] md:text-[40px]">
          RICH
        </Link>

        <button className="ml-auto p-1.5 text-foreground" aria-label="장바구니">
          <ShoppingBag className="h-[19px] w-[19px] stroke-[1.6]" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-black/10 bg-white">
          <nav className="max-h-[62vh] overflow-y-auto py-2">
            {categories.map((cat) => (
              <div key={cat.name}>
                <button
                  onClick={() => {
                    router.push(`/?category=${encodeURIComponent(cat.name)}`)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full px-6 py-3 text-left text-[12px] font-semibold tracking-[0.14em] text-[#333]"
                >
                  {cat.name}
                </button>
                {cat.subCategories.length > 0 && (
                  <div className="pb-1 pl-10">
                    {cat.subCategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          router.push(`/?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(sub)}`)
                          setMobileMenuOpen(false)
                        }}
                        className="w-full px-2 py-2 text-left text-[11px] tracking-wider text-gray-500"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-start bg-white/95 px-6 pt-[120px] backdrop-blur-sm">
          <button
            className="absolute right-6 top-6 p-2 text-gray-500"
            onClick={() => {
              setSearchOpen(false)
              setSearchQuery("")
            }}
            aria-label="검색 닫기"
          >
            <X className="h-6 w-6 stroke-[1.5]" />
          </button>

          <p className="mb-8 text-[11px] uppercase tracking-[0.3em] text-gray-400">검색</p>

          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <div className="flex items-center gap-3 border-b-2 border-black pb-3">
              <Search className="h-5 w-5 shrink-0 stroke-[1.5] text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="상품명, 카테고리 검색..."
                className="flex-1 bg-transparent text-[18px] font-light tracking-wide text-black placeholder:text-gray-300 outline-none md:text-[22px]"
              />
            </div>

            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="mt-8 w-full bg-black py-4 text-[11px] font-medium uppercase tracking-[0.25em] text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              검색하기
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
