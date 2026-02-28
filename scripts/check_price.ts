
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Supabase credentials missing')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkPrice() {
    const { data, error } = await supabase
        .from('products')
        .select('name, specs')
        .limit(5)

    if (error) {
        console.error('Error fetching products:', error)
        return
    }

    console.log('--- Product Prices ---')
    data.forEach((p: any) => {
        console.log(`Name: ${p.name}`)
        console.log(`Specs Price Raw:`, p.specs?.price)
        console.log('----------------------')
    })
}

checkPrice()
