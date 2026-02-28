
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

async function deleteAllData() {
    console.log('--- DELETING ALL DATA ---')

    // 1. Delete Products 
    console.log('Deleting Products...')
    const { error: prodError } = await supabase
        .from('products')
        .delete()
        .gte('created_at', '1900-01-01')

    if (prodError) {
        console.error('Error deleting products:', prodError)
        return
    }
    console.log(`Deleted products.`)

    // 2. Delete SubCategories 
    console.log('Deleting SubCategories...')
    const { error: subError } = await supabase
        .from('sub_categories')
        .delete()
        .gt('id', 0)

    if (subError) {
        console.error('Error deleting sub_categories:', subError)
        return
    }
    console.log(`Deleted sub_categories.`)

    // 3. Delete Categories
    console.log('Deleting Categories...')
    const { error: catError } = await supabase
        .from('categories')
        .delete()
        .gt('id', 0)

    if (catError) {
        console.error('Error deleting categories:', catError)
        return
    }
    console.log(`Deleted categories.`)

    console.log('--- SUCCESS: ALL DATA DELETED ---')
}

deleteAllData()
