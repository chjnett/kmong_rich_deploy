
import { createClient } from '@supabase/supabase-js'
import { products } from '../lib/data'

// Hardcoding credentials to ensure execution stability outside of Next.js context
const supabaseUrl = "https://vqlzwgsljcytqoqkznnq.supabase.co"
const supabaseAnonKey = "sb_publishable_Ihpno3Zz7RARxvb7OtX7rA_7hSGsuY3"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function restoreData() {
    console.log('Starting data restoration...')
    console.log(`Found ${products.length} products in local backup (lib/data.ts).`)

    // 1. Fetch Sub Categories to create a lookup map
    console.log('Fetching sub-categories...')
    const { data: subCats, error: subError } = await supabase
        .from('sub_categories')
        .select('id, name')

    if (subError) {
        console.error('Error fetching sub-categories:', subError)
        return
    }

    if (!subCats) {
        console.error('No sub-categories found via API. Cannot restore products safely.')
        return
    }

    // Map Name -> ID
    const subCatMap = new Map<string, number>()
    subCats.forEach(sc => subCatMap.set(sc.name, sc.id))

    // 2. Prepare Payload
    const productsToInsert = []
    const skippedProducts = []

    for (const p of products) {
        const subId = subCatMap.get(p.subCategory)

        if (!subId) {
            console.warn(`Warning: Could not find sub-category ID for "${p.subCategory}". Skipping product "${p.title}".`)
            skippedProducts.push(p.title)
            continue
        }

        // Combine image and gallery into img_urls
        // If gallery exists, prefer it. If not, use [image].
        // Ensure no duplicates if we merge (though usually gallery covers it)
        let images: string[] = []
        if (p.gallery && p.gallery.length > 0) {
            images = p.gallery
        } else if (p.image) {
            images = [p.image]
        }

        productsToInsert.push({
            name: p.title,
            sub_id: subId,
            description: p.description,
            external_url: p.externalUrl,
            price: null, // Legacy data didn't have price, explicit null or empty string
            img_urls: images,
            specs: p.specs
        })
    }

    console.log(`Prepared ${productsToInsert.length} products for insertion.`)

    if (productsToInsert.length === 0) {
        console.log('No valid products to insert.')
        return
    }

    // 3. Insert Data
    // We insert in batches or all at once? 100+ items might be too big for one HTTP request?
    // Supabase JS client handles batching reasonable well, but let's be safe and chunk it if needed.
    // 20 products is safely small.

    console.log('Inserting products...')

    const { error: insertError } = await supabase
        .from('products')
        .insert(productsToInsert)

    if (insertError) {
        console.error('Error inserting products:', insertError)
    } else {
        console.log('Successfully restored products!')
    }

    if (skippedProducts.length > 0) {
        console.log('Skipped products:', skippedProducts)
    }
}

restoreData()
