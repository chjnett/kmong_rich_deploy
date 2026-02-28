
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local manually since check is running outside Next.js
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath))
    for (const k in envConfig) {
        process.env[k] = envConfig[k]
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Error: Missing Supabase environment variables in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkStorage() {
    console.log(`Checking connection to Supabase: ${supabaseUrl}`)

    // Attempt to list files in the bucket
    const { data, error } = await supabase.storage.from('product-images').list()

    if (error) {
        console.error("❌ Storage Check Failed!")
        console.error(`   Error Message: ${error.message}`)
        if (error.message.includes("The resource was not found") || error.message.includes("Bucket not found")) {
            console.log("\n⚠️  Diagnosis: The 'product-images' bucket does NOT exist in your Supabase project.")
            console.log("   Action: Run the 'create_bucket.sql' script in Supabase SQL Editor.")
        }
    } else {
        console.log("✅ Storage Check Passed!")
        console.log("   Bucket 'product-images' is accessible.")
        console.log(`   File count in root: ${data?.length || 0}`)
    }
}

checkStorage()
