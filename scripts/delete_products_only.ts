
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load env
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars: any = {}
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=')
    if (key && val) envVars[key.trim()] = val.trim()
})

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function deleteAllProducts() {
    console.log('Fetching all products...')

    // First, get all products
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id')

    if (fetchError) {
        console.error('Error fetching products:', fetchError)
        return
    }

    console.log(`Found ${products?.length || 0} products to delete`)

    if (!products || products.length === 0) {
        console.log('No products to delete')
        return
    }

    // Delete each product
    for (const product of products) {
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id)

        if (deleteError) {
            console.error(`Error deleting product ${product.id}:`, deleteError)
        } else {
            console.log(`Deleted product ${product.id}`)
        }
    }

    console.log('--- ALL PRODUCTS DELETED ---')
}

deleteAllProducts()
