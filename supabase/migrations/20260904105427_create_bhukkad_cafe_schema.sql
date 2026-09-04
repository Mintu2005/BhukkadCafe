/*
# Bhukkad Cafe - Complete Database Schema

## Overview
Creates the full schema for the Bhukkad Cafe food ordering app: categories, menu items,
orders, order items, and admin authentication support.

## New Tables

### categories
- `id` (uuid, primary key)
- `name` (text, unique, not null) — e.g. "Pizza", "Burger"
- `slug` (text, unique, not null) — URL-friendly identifier
- `display_order` (int, default 0) — sort order for display
- `icon` (text) — emoji or icon name for category shortcut
- `created_at` (timestamptz)

### menu_items
- `id` (uuid, primary key)
- `category_id` (uuid, FK → categories.id)
- `name` (text, not null) — item name from the real menu
- `description` (text) — short description
- `price` (numeric(10,2), not null) — price in INR
- `image_url` (text) — food photo URL
- `is_popular` (boolean, default false) — shown on home page
- `is_available` (boolean, default true) — admin can toggle
- `display_order` (int, default 0)
- `created_at` (timestamptz)

### orders
- `id` (uuid, primary key)
- `order_number` (text, unique) — human-readable order number like "BC-1001"
- `customer_name` (text, not null)
- `mobile_number` (text, not null)
- `order_type` (text, not null) — 'dine_in' or 'takeaway'
- `table_number` (text) — only for dine_in
- `special_instructions` (text)
- `status` (text, not null, default 'pending') — pending/accepted/preparing/ready/completed/rejected
- `subtotal` (numeric(10,2), not null)
- `total` (numeric(10,2), not null)
- `estimated_minutes` (int, default 20) — estimated prep time
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### order_items
- `id` (uuid, primary key)
- `order_id` (uuid, FK → orders.id, ON DELETE CASCADE)
- `menu_item_id` (uuid, FK → menu_items.id)
- `item_name` (text, not null) — snapshot of name at order time
- `price` (numeric(10,2), not null) — snapshot of price
- `quantity` (int, not null, default 1)

## Security (RLS)

### categories
- Public read (anon, authenticated) — all customers can see categories
- Authenticated write (admin only) — only signed-in admin can modify

### menu_items
- Public read (anon, authenticated) — all customers can see menu
- Authenticated write (admin only)

### orders
- Public insert (anon, authenticated) — customers can place orders without signing in
- Authenticated read/update (admin only) — only admin can view and manage orders

### order_items
- Public insert (anon, authenticated) — created when order is placed
- Authenticated read (admin only)

## Notes
1. This is a hybrid app: customers order without authentication, admin signs in.
2. Any authenticated user is treated as admin (only admin signs in).
3. An order number sequence is generated via a stored function.
*/

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==================== CATEGORIES ====================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ==================== MENU ITEMS ====================
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  is_popular boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_menu_items" ON menu_items;
CREATE POLICY "public_read_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_menu_items" ON menu_items;
CREATE POLICY "admin_insert_menu_items" ON menu_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_menu_items" ON menu_items;
CREATE POLICY "admin_update_menu_items" ON menu_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_menu_items" ON menu_items;
CREATE POLICY "admin_delete_menu_items" ON menu_items FOR DELETE
  TO authenticated USING (true);

-- ==================== ORDERS ====================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  mobile_number text NOT NULL,
  order_type text NOT NULL DEFAULT 'takeaway',
  table_number text,
  special_instructions text,
  status text NOT NULL DEFAULT 'pending',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  estimated_minutes int NOT NULL DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- ==================== ORDER ITEMS ====================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
CREATE POLICY "admin_read_order_items" ON order_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_order_items" ON order_items;
CREATE POLICY "admin_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_order_items" ON order_items;
CREATE POLICY "admin_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (true);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_popular ON menu_items(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ==================== ORDER NUMBER FUNCTION ====================
-- Generates sequential order numbers like BC-1001, BC-1002, etc.
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  next_num int;
  order_num text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS int)), 1000) + 1
  INTO next_num
  FROM orders
  WHERE order_number LIKE 'BC-%';
  
  order_num := 'BC-' || next_num::text;
  RETURN order_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== UPDATED_AT TRIGGER ====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
