
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

async function checkCounts() {
    const { count: prodCount, error: prodError } = await supabase.from('products').select('*', { count: 'exact', head: true })
    console.log('Products remaining:', prodCount, prodError || '')

    const { count: subCount, error: subError } = await supabase.from('sub_categories').select('*', { count: 'exact', head: true })
    console.log('SubCategories remaining:', subCount, subError || '')

    const { count: catCount, error: catError } = await supabase.from('categories').select('*', { count: 'exact', head: true })
    console.log('Categories remaining:', catCount, catError || '')
}

checkCounts()
