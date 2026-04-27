-- Align UI permissions with database enforcement for Orodha auth roles.
-- Admin: full write access
-- Surgeon / Anaesthetist: read-only access in this app version

DROP POLICY IF EXISTS "sessions admin surgeon write" ON public.theatre_sessions;
DROP POLICY IF EXISTS "sessions admin write" ON public.theatre_sessions;
CREATE POLICY "sessions admin write" ON public.theatre_sessions
FOR ALL
USING (public.current_user_role() = 'Admin')
WITH CHECK (public.current_user_role() = 'Admin');

DROP POLICY IF EXISTS "patients create clinical" ON public.patients;
DROP POLICY IF EXISTS "patients update clinical" ON public.patients;
DROP POLICY IF EXISTS "patients admin write" ON public.patients;
CREATE POLICY "patients admin write" ON public.patients
FOR ALL
USING (public.current_user_role() = 'Admin')
WITH CHECK (public.current_user_role() = 'Admin');

DROP POLICY IF EXISTS "cases create clinical" ON public.surgical_cases;
DROP POLICY IF EXISTS "cases update clinical" ON public.surgical_cases;
DROP POLICY IF EXISTS "cases admin write" ON public.surgical_cases;
CREATE POLICY "cases admin write" ON public.surgical_cases
FOR ALL
USING (public.current_user_role() = 'Admin')
WITH CHECK (public.current_user_role() = 'Admin');

DROP POLICY IF EXISTS "preop update clinical" ON public.preop_assessments;
DROP POLICY IF EXISTS "preop admin write" ON public.preop_assessments;
CREATE POLICY "preop admin write" ON public.preop_assessments
FOR ALL
USING (public.current_user_role() = 'Admin')
WITH CHECK (public.current_user_role() = 'Admin');

DROP POLICY IF EXISTS "bookings create clinical" ON public.bookings;
DROP POLICY IF EXISTS "bookings update clinical" ON public.bookings;
DROP POLICY IF EXISTS "bookings admin write" ON public.bookings;
CREATE POLICY "bookings admin write" ON public.bookings
FOR ALL
USING (public.current_user_role() = 'Admin')
WITH CHECK (public.current_user_role() = 'Admin');

DROP POLICY IF EXISTS "notes create approved" ON public.case_notes;
DROP POLICY IF EXISTS "notes admin write" ON public.case_notes;
CREATE POLICY "notes admin write" ON public.case_notes
FOR ALL
USING (public.current_user_role() = 'Admin')
WITH CHECK (public.current_user_role() = 'Admin');
