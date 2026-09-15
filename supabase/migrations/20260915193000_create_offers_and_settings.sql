/*
# Migration: Create Offers and App Settings Tables
# File: supabase/migrations/20260915193000_create_offers_and_settings.sql

## Overview:
1. Creates `offers` table for managing Cafe offers and Today's Special items.
2. Creates `app_settings` table for global application toggles (e.g. master "show_today_offers" switch).
3. Applies strict Row Level Security (RLS) policies:
   - Customers (anon + authenticated) can view active offers and app settings.
   - Only verified administrators (auth.jwt() -> app_metadata -> role = 'admin') can insert, update, or delete.
4. Seeds the default setting `show_today_offers = 'true'`.
5. No dummy or unwanted sample offers are seeded into the offers table.
*/

-- Enable pgcrypto for gen_random_uuid if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 1. OFFERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  original_price numeric(10,2),
  offer_price numeric(10,2) NOT NULL,
  discount_text text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  is_today_special boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure RLS is enabled on offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- 1.1 Public Read: Customers can view active offers; Admins can view all offers
DROP POLICY IF EXISTS "public_read_active_offers" ON offers;
CREATE POLICY "public_read_active_offers" ON offers
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 1.2 Admin INSERT
DROP POLICY IF EXISTS "admin_insert_offers" ON offers;
CREATE POLICY "admin_insert_offers" ON offers
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 1.3 Admin UPDATE
DROP POLICY IF EXISTS "admin_update_offers" ON offers;
CREATE POLICY "admin_update_offers" ON offers
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 1.4 Admin DELETE
DROP POLICY IF EXISTS "admin_delete_offers" ON offers;
CREATE POLICY "admin_delete_offers" ON offers
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_offers_active_today ON offers(is_active, is_today_special) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offers_display_order ON offers(display_order);

-- Automatic updated_at trigger for offers
DROP TRIGGER IF EXISTS offers_updated_at ON offers;
CREATE TRIGGER offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ==============================================================================
-- 2. APP_SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure RLS is enabled on app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 2.1 Public Read: Customers and admins can read app settings
DROP POLICY IF EXISTS "public_read_app_settings" ON app_settings;
CREATE POLICY "public_read_app_settings" ON app_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2.2 Admin INSERT / UPDATE / DELETE
DROP POLICY IF EXISTS "admin_insert_app_settings" ON app_settings;
CREATE POLICY "admin_insert_app_settings" ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_app_settings" ON app_settings;
CREATE POLICY "admin_update_app_settings" ON app_settings
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_delete_app_settings" ON app_settings;
CREATE POLICY "admin_delete_app_settings" ON app_settings
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Automatic updated_at trigger for app_settings
DROP TRIGGER IF EXISTS app_settings_updated_at ON app_settings;
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed initial master switch setting
INSERT INTO app_settings (key, value, description)
VALUES (
  'show_today_offers',
  'true',
  'Master switch to show/hide Today Special offers on the customer home page'
)
ON CONFLICT (key) DO NOTHING;
