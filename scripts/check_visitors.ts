
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkVisitorStats() {
    const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: stats, error } = await s.rpc('get_visitor_stats')

    if (error) {
        console.error(error)
        return
    }

    console.log('Current Visitor Stats:', stats)

    const { data: history } = await s.from('visitor_daily_stats').select('*').order('date', { ascending: false }).limit(7)
    console.log('Last 7 days history:', history)
}

checkVisitorStats()
