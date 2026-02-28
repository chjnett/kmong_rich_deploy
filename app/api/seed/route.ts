import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { categories, products } from "@/lib/data"

export async function GET() {
    try {
        // 1. Clear existing data (in reverse dependency order)
        const { error: cleanError } = await supabase.from("products").delete().neq("name", "PLACEHOLDER_FOR_ALL")
        if (cleanError) throw cleanError

        await supabase.from("sub_categories").delete().neq("name", "PLACEHOLDER_FOR_ALL")
        await supabase.from("categories").delete().neq("name", "PLACEHOLDER_FOR_ALL")

        const categoryMap = new Map<string, number>()
        const subCategoryMap = new Map<string, number>()

        // 2. Insert Categories
        for (const [index, cat] of categories.entries()) {
            if (cat.name === "전체") continue // Skip 'All' virtual category

            const { data, error } = await supabase
                .from("categories")
                .insert({ name: cat.name, order: index })
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error(`Failed to insert category: ${cat.name}`)

            categoryMap.set(cat.name, data.id)

            // 3. Insert Sub Categories
            for (const subName of cat.subCategories) {
                const { data: subData, error: subError } = await supabase
                    .from("sub_categories")
                    .insert({ category_id: data.id, name: subName })
                    .select()
                    .single()

                if (subError) throw subError
                if (!subData) throw new Error(`Failed to insert sub-category: ${subName}`)

                subCategoryMap.set(`${cat.name}:${subName}`, subData.id)
            }
        }

        // 4. Insert Products
        for (const p of products) {
            const subKey = `${p.category}:${p.subCategory}`
            const subId = subCategoryMap.get(subKey)

            if (!subId) {
                console.warn(`Skipping product ${p.title}: Sub-category not found (${subKey})`)
                continue
            }

            // Merge single image into gallery if gallery is missing, or ensure both exist in img_urls
            const imgUrls = p.gallery && p.gallery.length > 0 ? p.gallery : [p.image]

            const { error } = await supabase.from("products").insert({
                sub_id: subId,
                name: p.title,
                img_urls: imgUrls,
                external_url: p.externalUrl,
                description: p.description,
                specs: p.specs as any // jsonb casting
            })

            if (error) throw error
        }

        return NextResponse.json({ success: true, message: "Database seeded successfully" })
    } catch (error: any) {
        console.error("Seeding error:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
