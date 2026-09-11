/*
# Critical Security RLS Lockdown

## Summary of Changes:
1. Orders & Order Items:
   - REVOKED public SELECT policies ("public_read_orders", "public_read_order_items", "admin_read_orders", "admin_read_order_items")
     to completely eliminate customer PII leaks and unauthorized order browsing.
   - REVOKED direct public/anon INSERT policies ("public_insert_orders", "public_insert_order_items")
     so orders cannot bypass the server-side pricing validation in create_order_secure RPC.
   - REVOKED broad authenticated management policies.
   - CREATED strict admin-only policies requiring `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`.
   - Preserves customer order placement through `create_order_secure` RPC (SECURITY DEFINER).
   - Preserves customer order tracking through `get_order_by_token` RPC (SECURITY DEFINER).
   - Preserves real-time order alerts for authenticated administrators.

2. Categories & Menu Items:
   - Preserved public SELECT access for `anon, authenticated` so customers can view the menu.
   - REVOKED broad authenticated management policies.
   - CREATED strict admin-only INSERT, UPDATE, and DELETE policies requiring
     `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`.
*/

-- ==============================================================================
-- 1. ORDERS TABLE RLS LOCKDOWN
-- ==============================================================================

-- Drop all existing read policies on orders
DROP POLICY IF EXISTS "public_read_orders" ON orders;
DROP POLICY IF EXISTS "admin_read_orders" ON orders;
DROP POLICY IF EXISTS "admin_select_orders" ON orders;

-- Drop public/anon insert policy
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
DROP POLICY IF EXISTS "admin_insert_orders" ON orders;

-- Drop broad authenticated update & delete policies
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
DROP POLICY IF EXISTS "admin_delete_orders" ON orders;

-- Ensure RLS is active
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 1.1 Admin-only SELECT policy
CREATE POLICY "admin_select_orders" ON orders
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 1.2 Admin-only INSERT policy (normal customer orders go through create_order_secure RPC)
CREATE POLICY "admin_insert_orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 1.3 Admin-only UPDATE policy
CREATE POLICY "admin_update_orders" ON orders
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 1.4 Admin-only DELETE policy
CREATE POLICY "admin_delete_orders" ON orders
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 2. ORDER_ITEMS TABLE RLS LOCKDOWN
-- ==============================================================================

-- Drop all existing read policies on order_items
DROP POLICY IF EXISTS "public_read_order_items" ON order_items;
DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
DROP POLICY IF EXISTS "admin_select_order_items" ON order_items;

-- Drop public/anon insert policy
DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
DROP POLICY IF EXISTS "admin_insert_order_items" ON order_items;

-- Drop broad authenticated update & delete policies
DROP POLICY IF EXISTS "admin_update_order_items" ON order_items;
DROP POLICY IF EXISTS "admin_delete_order_items" ON order_items;

-- Ensure RLS is active
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 2.1 Admin-only SELECT policy
CREATE POLICY "admin_select_order_items" ON order_items
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2.2 Admin-only INSERT policy
CREATE POLICY "admin_insert_order_items" ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2.3 Admin-only UPDATE policy
CREATE POLICY "admin_update_order_items" ON order_items
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2.4 Admin-only DELETE policy
CREATE POLICY "admin_delete_order_items" ON order_items
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 3. CATEGORIES TABLE RLS LOCKDOWN
-- ==============================================================================

-- Ensure RLS is active
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 3.1 Public read access for customers
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Drop broad authenticated management policies
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
DROP POLICY IF EXISTS "admin_update_categories" ON categories;
DROP POLICY IF EXISTS "admin_delete_categories" ON categories;

-- 3.2 Admin-only INSERT policy
CREATE POLICY "admin_insert_categories" ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 3.3 Admin-only UPDATE policy
CREATE POLICY "admin_update_categories" ON categories
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 3.4 Admin-only DELETE policy
CREATE POLICY "admin_delete_categories" ON categories
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 4. MENU_ITEMS TABLE RLS LOCKDOWN
-- ==============================================================================

-- Ensure RLS is active
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- 4.1 Public read access for customers
DROP POLICY IF EXISTS "public_read_menu_items" ON menu_items;
CREATE POLICY "public_read_menu_items" ON menu_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Drop broad authenticated management policies
DROP POLICY IF EXISTS "admin_insert_menu_items" ON menu_items;
DROP POLICY IF EXISTS "admin_update_menu_items" ON menu_items;
DROP POLICY IF EXISTS "admin_delete_menu_items" ON menu_items;

-- 4.2 Admin-only INSERT policy
CREATE POLICY "admin_insert_menu_items" ON menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 4.3 Admin-only UPDATE policy
CREATE POLICY "admin_update_menu_items" ON menu_items
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 4.4 Admin-only DELETE policy
CREATE POLICY "admin_delete_menu_items" ON menu_items
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
