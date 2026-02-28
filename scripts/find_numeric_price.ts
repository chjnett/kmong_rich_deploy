
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

async function findNumericPrice() {
    // Fetch more products
    const { data, error } = await supabase
        .from('products')
        .select('name, specs')
        .limit(100)

    if (error) {
        fs.writeFileSync('price_find_error.txt', JSON.stringify(error))
        return
    }

    let output = '--- Numeric Prices Candidates ---\n'

    data.forEach((p: any) => {
        const price = p.specs?.price
        // Check if price looks numeric (not "문의", not empty)
        if (price && price !== '문의' && !isNaN(Number(String(price).replace(/,/g, '')))) {
            output += `Name: ${p.name}\n`
            output += `Price: ${price}\n`
            output += `Parsed: ${Number(String(price).replace(/,/g, ''))}\n`
            output += '----------------\n'
        }
    })

    fs.writeFileSync('price_numeric_output.txt', output)
    console.log('Done searching.')
}

findNumericPrice()
