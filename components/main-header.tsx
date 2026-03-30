import { supabase } from "@/lib/supabase"
import type { Category } from "@/lib/data"
import { HeaderClient } from "./header-client"

export async function MainHeader() {
    const { data: categoriesData } = await supabase
        .from('categories')
        .select('*, sub_categories(name, id)')
        .order('order', { ascending: true })

    // Map to UI Category Interface
    const mappedCategories: Category[] = [
        { name: "전체", subCategories: [] },
        ...(categoriesData?.map((c: any) => ({
            name: c.name,
            subCategories: c.sub_categories?.map((s: any) => s.name) || []
        })) || [])
    ]

    // Manual swap for "시계" and "가방" positions to reflect user preference
    const bagIndex = mappedCategories.findIndex(c => c.name.includes("가방"));
    const watchIndex = mappedCategories.findIndex(c => c.name.includes("시계"));
    if (bagIndex !== -1 && watchIndex !== -1) {
        const temp = mappedCategories[bagIndex];
        mappedCategories[bagIndex] = mappedCategories[watchIndex];
        mappedCategories[watchIndex] = temp;
    }

    return <HeaderClient categories={mappedCategories} />
}
