/*
# Supabase Storage Migration: menu-images Bucket

## Overview
Creates the `menu-images` storage bucket for cafe menu items with public read access
and strict admin-only write/update/delete permissions verified via `app_metadata.role = 'admin'`.

## Permissions:
- Public Read (SELECT): Anyone (anon + authenticated) can view menu images.
- Admin Write (INSERT): Only authenticated users with `app_metadata.role = 'admin'`.
- Admin Update (UPDATE): Only authenticated users with `app_metadata.role = 'admin'`.
- Admin Delete (DELETE): Only authenticated users with `app_metadata.role = 'admin'`.
- Normal authenticated users without admin role: NO upload/update/delete access.
*/

-- 1. Create or update the menu-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Storage RLS Policy: Public read access for everyone
DROP POLICY IF EXISTS "public_read_menu_images" ON storage.objects;
CREATE POLICY "public_read_menu_images" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'menu-images');

-- 3. Storage RLS Policy: Admin INSERT (only users with app_metadata.role = 'admin')
DROP POLICY IF EXISTS "admin_insert_menu_images" ON storage.objects;
CREATE POLICY "admin_insert_menu_images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'menu-images' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 4. Storage RLS Policy: Admin UPDATE (only users with app_metadata.role = 'admin')
DROP POLICY IF EXISTS "admin_update_menu_images" ON storage.objects;
CREATE POLICY "admin_update_menu_images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'menu-images' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    bucket_id = 'menu-images' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 5. Storage RLS Policy: Admin DELETE (only users with app_metadata.role = 'admin')
DROP POLICY IF EXISTS "admin_delete_menu_images" ON storage.objects;
CREATE POLICY "admin_delete_menu_images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'menu-images' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
