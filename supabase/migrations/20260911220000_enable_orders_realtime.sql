/*
# Enable Realtime for orders table

## Overview
Ensures that the `orders` table is included in the Supabase Realtime publication
(`supabase_realtime`) so that INSERT and UPDATE events are broadcast to the client.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;
