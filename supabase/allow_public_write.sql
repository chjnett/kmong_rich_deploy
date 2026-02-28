-- DANGER: This allows ANYONE with the Anon Key to Insert/Update/Delete data.
-- Use this ONLY for development/seeding purposes if you haven't set up Service Role Key.

-- 1. Drop existing read-only policies
drop policy if exists "Allow public read access on categories" on categories;
drop policy if exists "Allow public read access on sub_categories" on sub_categories;
drop policy if exists "Allow public read access on products" on products;

-- 2. Create permissive policies (Read + Write)
create policy "Enable all access for all users" on categories for all using (true) with check (true);
create policy "Enable all access for all users" on sub_categories for all using (true) with check (true);
create policy "Enable all access for all users" on products for all using (true) with check (true);

-- Note: After seeding, for production, you should revert this by running schema.sql again.
