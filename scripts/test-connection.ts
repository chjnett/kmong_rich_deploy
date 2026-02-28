
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// .env.local 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Checking connection with:')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? 'Loaded (Hidden)' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    console.log('\nAttempting to fetch categories...')

    const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1)

    if (error) {
        console.error('❌ Connection Failed:', error.message)
        if (error.code === 'PGRST301') {
            console.error('Hint: JWT/API Key issue. Check if you are using the correct Anon Key.')
        }
    } else {
        console.log('✅ Connection Successful!')
        console.log('Query result:', data)
    }
}

testConnection()
