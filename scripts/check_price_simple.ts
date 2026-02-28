
import { createClient } from '@supabase/supabase-js'

// Reading .env.local manually
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars: any = {}
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=')
    if (key && val) envVars[key.trim()] = val.trim()
})

const url = envVars.NEXT_PUBLIC_SUPABASE_URL
const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(url, key)

async function checkPrice() {
    const { data, error } = await supabase
        .from('products')
        .select('name, specs')
        .limit(5)

    if (error) {
        fs.writeFileSync('price_error.txt', JSON.stringify(error, null, 2))
        return
    }

    let output = '--- Product Prices ---\n'
    data.forEach((p: any) => {
        output += `Name: ${p.name}\n`
        output += `Specs Price Raw: ${p.specs?.price} (Type: ${typeof p.specs?.price})\n`
        output += '----------------------\n'
    })

    fs.writeFileSync('price_output.txt', output)
    console.log('Done writing to price_output.txt')
}

checkPrice()
