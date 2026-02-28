'use server'

import { createClient } from '@supabase/supabase-js'

// We use the service role key if available for secure operations, but for these public RPCs, anon key is fine
// IF RLS is set up correctly with SECURITY DEFINER functions as in our SQL script.
// However, to be safe and ensure it works even if RLS is strict, we can use the standard client.
// Since we are using standard `createClient` here without cookies (Server Actions), 
// we normally need `process.env.NEXT_PUBLIC_SUPABASE_URL` etc.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function incrementVisitor() {
    try {
        const { error } = await supabase.rpc('increment_visitor_count')
        if (error) {
            console.error('Error incrementing visitor count:', error)
        }
    } catch (err) {
        console.error('Unexpected error tracking visitor:', err)
    }
}

export async function getVisitorStats() {
    try {
        const { data, error } = await supabase.rpc('get_visitor_stats')

        if (error) {
            console.error('Error fetching visitor stats:', error)
            return { today_count: 0, total_count: 0 }
        }

        return data as { today_count: number; total_count: number }
    } catch (err) {
        console.error('Unexpected error fetching stats:', err)
        return { today_count: 0, total_count: 0 }
    }
}
