"use client"

import type { Category } from "@/lib/data"
import { cn } from "@/lib/utils"

import { useRouter } from "next/navigation"
import { compareLabels } from "@/lib/utils/label-utils"

interface CategoryNavProps {
  categories: Category[]
  selectedCategory: string
  selectedSubCategory: string | null
}

export function CategoryNav({
  categories,
  selectedCategory,
  selectedSubCategory,
}: CategoryNavProps) {
  const router = useRouter()

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to new category, clear subcategory
    router.push(`/?category=${encodeURIComponent(categoryName)}`, { scroll: false })
  }

  const handleSubCategoryClick = (subCategoryName: string | null) => {
    // Keep current category, set subcategory
    if (subCategoryName) {
      router.push(`/?category=${encodeURIComponent(selectedCategory)}&subCategory=${encodeURIComponent(subCategoryName)}`, { scroll: false })
    } else {
      router.push(`/?category=${encodeURIComponent(selectedCategory)}`, { scroll: false })
    }
  }

  const currentCategory = categories.find((c) => compareLabels(c.name, selectedCategory))
  const subCategories = currentCategory?.subCategories || []

  return (
    <nav className="mb-14 space-y-8">
      {/* Main Categories - Clean Tabs */}
      <div className="flex flex-wrap justify-center gap-6 border-b border-border/60 pb-4 md:gap-12">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => handleCategoryClick(category.name)}
            className={cn(
              "relative px-1 py-2 text-sm font-medium tracking-tight transition-all duration-300 md:text-[15px]",
              compareLabels(selectedCategory, category.name)
                ? "text-foreground"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            {category.name}
            {compareLabels(selectedCategory, category.name) && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Sub Categories - Minimal Pills */}
      {subCategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 transition-opacity duration-500 ease-in-out">
          <button
            onClick={() => handleSubCategoryClick(null)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-normal transition-all duration-300",
              selectedSubCategory === null
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
            )}
          >
            전체보기
          </button>
          {subCategories.map((sub) => (
            <button
              key={sub}
              onClick={() => handleSubCategoryClick(sub)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-normal transition-all duration-300",
                compareLabels(selectedSubCategory, sub)
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
              )}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
