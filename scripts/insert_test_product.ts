
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

async function insertTestProduct() {
    // Find a category/subcategory first
    const { data: catData } = await supabase.from('categories').select('id').limit(1).single()
    const { data: subData } = await supabase.from('sub_categories').select('id').eq('category_id', catData.id).limit(1).single()

    if (!subData) {
        console.log('No subcategory found')
        return
    }

    // Insert test product with price "1250"
    const { data, error } = await supabase
        .from('products')
        .insert({
            sub_id: subData.id,
            name: 'TEST_PRICE_PRODUCT',
            description: 'Test product for price debugging',
            external_url: '',
            img_urls: [],
            specs: {
                brand: 'TestBrand',
                price: '1250' // Ambiguous price
            }
        })
        .select()

    if (error) console.error('Error inserting:', error)
    else console.log('Inserted test product:', data[0])
}

insertTestProduct()
