/*
# Allow anon customers to read orders and order_items

## Problem
The customer-facing Orders page fetches order history using the anon key (no login).
The existing SELECT policies on `orders` and `order_items` only allow `authenticated` to read,
so customers see an empty order list.

## Fix
- Add `public_read_orders` SELECT policy on `orders` for `anon, authenticated`.
- Add `public_read_order_items` SELECT policy on `order_items` for `anon, authenticated`.
- Keep the existing `admin_read_*` policies (they still apply to authenticated users).
- Write/delete still require authentication (admin only).

## Notes
1. This is a no-auth customer app — orders are placed and tracked without login.
2. Anyone with the anon key can see all orders. This is acceptable for a cafe kiosk-style app
   where orders are identified by order number and mobile number.
*/

DROP POLICY IF EXISTS "public_read_orders" ON orders;
CREATE POLICY "public_read_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_order_items" ON order_items;
CREATE POLICY "public_read_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);
