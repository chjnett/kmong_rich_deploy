import { supabase } from "@/lib/supabase"
import { SeedButton } from "@/components/seed-button"

// Force dynamic to ensure we always get latest DB state
export const dynamic = "force-dynamic"

export default async function TestDBPage() {
    // 1. Fetch Categories
    const { data: categories, error: catError } = await supabase.from("categories").select("*").order("order")

    // 2. Fetch first 5 Products
    const { data: products, error: prodError } = await supabase.from("products").select("*").limit(5)

    if (catError || prodError) {
        return (
            <div className="p-8 text-red-500">
                <h1 className="text-2xl font-bold mb-4">Database Connection Error</h1>
                <pre>{JSON.stringify({ catError, prodError }, null, 2)}</pre>
                <div className="mt-8">
                    <p className="text-white mb-2">You can try seeding if tables exist but are empty:</p>
                    <SeedButton />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#c9a962]">Supabase Connection Test</h1>
                <SeedButton />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <section className="border border-[#333] p-4 rounded bg-[#111]">
                    <h2 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">Categories ({categories?.length})</h2>
                    <pre className="text-xs overflow-auto max-h-[400px] text-green-400">
                        {JSON.stringify(categories, null, 2)}
                    </pre>
                </section>

                <section className="border border-[#333] p-4 rounded bg-[#111]">
                    <h2 className="text-xl font-bold mb-4 border-b border-[#333] pb-2">Products Sample ({products?.length})</h2>
                    <pre className="text-xs overflow-auto max-h-[400px] text-blue-400">
                        {JSON.stringify(products, null, 2)}
                    </pre>
                </section>
            </div>

            <div className="mt-8 p-4 bg-[#1a1a1a] rounded text-sm text-gray-400">
                <p>If you see data above, the DB connection and Seed are working correctly.</p>
                <p>Current Time: {new Date().toLocaleString()}</p>
            </div>
        </div>
    )
}
