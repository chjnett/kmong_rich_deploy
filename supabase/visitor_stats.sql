-- Create a table to track daily visitor counts
CREATE TABLE IF NOT EXISTS public.visitor_daily_stats (
    date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    count INTEGER DEFAULT 0
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.visitor_daily_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for displaying stats)
CREATE POLICY "Allow public read access"
    ON public.visitor_daily_stats
    FOR SELECT
    TO public
    USING (true);

-- Allow server-side updates (Service Role only recommended, but for simplicity here we use a function)
-- Ideally, modifications should only happen via our RPC function which bypasses RLS if `security definer` is used.

-- RPC Function to increment visitor count
-- This function is secure because it doesn't take an arbitrary count, it only increments by 1.
CREATE OR REPLACE FUNCTION increment_visitor_count(visit_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.visitor_daily_stats (date, count)
    VALUES (visit_date, 1)
    ON CONFLICT (date)
    DO UPDATE SET count = visitor_daily_stats.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- SECURITY DEFINER allows this function to run with the privileges of the creator (usually postgres/service_role), 
-- bypassing the table's RLS for the update operation for public users.

-- RPC Function to get visitor stats (Today & Total)
CREATE OR REPLACE FUNCTION get_visitor_stats()
RETURNS JSON AS $$
DECLARE
    today_val INTEGER;
    total_val INTEGER;
BEGIN
    -- Get today's count
    SELECT count INTO today_val 
    FROM public.visitor_daily_stats 
    WHERE date = CURRENT_DATE;

    -- Get total count
    SELECT COALESCE(SUM(count), 0) INTO total_val 
    FROM public.visitor_daily_stats;
    
    -- Handle null if no record for today
    IF today_val IS NULL THEN
        today_val := 0;
    END IF;

    RETURN json_build_object(
        'today_count', today_val,
        'total_count', total_val
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to public/anon (so the frontend/server action can call it)
GRANT EXECUTE ON FUNCTION increment_visitor_count(DATE) TO public;
GRANT EXECUTE ON FUNCTION increment_visitor_count(DATE) TO anon;
GRANT EXECUTE ON FUNCTION increment_visitor_count(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_visitor_stats() TO public;
GRANT EXECUTE ON FUNCTION get_visitor_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_visitor_stats() TO authenticated;
