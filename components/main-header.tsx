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

    return <HeaderClient categories={mappedCategories} />
}
