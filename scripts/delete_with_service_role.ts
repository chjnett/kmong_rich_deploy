
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

// Use SERVICE_ROLE_KEY to bypass RLS
const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function deleteAllProductsWithServiceRole() {
    console.log('Using SERVICE_ROLE_KEY to delete all products...')

    // Delete all products with service role (bypasses RLS)
    const { error, count } = await supabase
        .from('products')
        .delete()
        .gte('created_at', '1900-01-01')

    if (error) {
        console.error('Error deleting products:', error)
        return
    }

    console.log('✅ ALL PRODUCTS DELETED SUCCESSFULLY')

    // Verify
    const { count: remainingCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

    console.log(`Products remaining: ${remainingCount || 0}`)
}

deleteAllProductsWithServiceRole()
