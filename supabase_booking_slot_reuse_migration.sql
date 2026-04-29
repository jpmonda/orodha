-- Allow cancelled/postponed bookings to remain visible while freeing the slot.
-- Run this once in Supabase SQL Editor after the main schema/migrations.

ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_session_id_slot_key;

ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_session_id_order_on_list_key;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_session_slot_key
ON public.bookings (session_id, slot)
WHERE booking_status IN ('Booked', 'Done', 'No-show');

CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_session_order_key
ON public.bookings (session_id, order_on_list)
WHERE order_on_list IS NOT NULL
  AND booking_status IN ('Booked', 'Done', 'No-show');
