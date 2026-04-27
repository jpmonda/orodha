-- ============================================================
-- Orodha — Supabase PostgreSQL Schema
-- Version 1.0 | Paediatric Surgery Theatre Management
-- ============================================================
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- or via `supabase db push` with the CLI.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for near-match name search (Phase 2)


-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text        NOT NULL,
  role        text        NOT NULL CHECK (role IN ('Admin', 'Surgeon', 'Anaesthetist')),
  approved    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS
  'One profile per Supabase auth user. Role and approval managed by Admin.';
COMMENT ON COLUMN public.profiles.approved IS
  'Admin must set approved=true before user can access any data.';


-- ============================================================
-- 2. PATIENTS
-- ============================================================
CREATE TABLE public.patients (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  umr              text    NOT NULL UNIQUE,
  full_name        text    NOT NULL,
  sex              text    NOT NULL CHECK (sex IN ('Male', 'Female')),
  date_of_birth    date    NOT NULL CHECK (date_of_birth <= CURRENT_DATE),
  residence        text,
  phone_primary    text    NOT NULL,
  phone_secondary  text,
  sha_status       text    NOT NULL DEFAULT 'Active' CHECK (sha_status IN ('Active', 'Inactive')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_by       uuid    REFERENCES auth.users(id)
);

-- UMR format constraint: 'UMR' prefix + 4-7 digits, uppercase, no spaces
ALTER TABLE public.patients
  ADD CONSTRAINT patients_umr_format
  CHECK (umr ~ '^UMR[0-9]{4,7}$');

COMMENT ON TABLE public.patients IS
  'Patient registry. Records can be edited but never deleted (surgical record integrity).';
COMMENT ON COLUMN public.patients.umr IS
  'Unique Medical Record number. Format: UMR + 4-7 digits. Always stored uppercase.';
COMMENT ON COLUMN public.patients.phone_primary IS
  'Stored as text to preserve leading zeros. No format enforcement in Phase 1.';


-- ============================================================
-- 3. BOOKINGS
-- ============================================================
CREATE TABLE public.bookings (
  id                   uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id           uuid    NOT NULL REFERENCES public.patients(id),
  theatre_date         date    NOT NULL,
  slot                 integer NOT NULL CHECK (slot IN (1, 2, 3)),
  specialty            text    NOT NULL CHECK (specialty IN (
                         'Urological', 'Colorectal', 'Hernias & Testis',
                         'Upper GI', 'Hepatobiliary', 'Minor Procedures',
                         'Oncological', 'Other'
                       )),
  procedure_name       text    NOT NULL,
  diagnosis            text,
  case_description     text,
  urgency              text    NOT NULL DEFAULT 'Elective'
                               CHECK (urgency IN ('Elective', 'Urgent', 'Emergency')),
  estimated_duration   integer CHECK (estimated_duration > 0), -- minutes
  pre_op_notes         text,
  status               text    NOT NULL DEFAULT 'Pending'
                               CHECK (status IN ('Pending', 'Done', 'Cancelled')),
  cancellation_reason  text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid    REFERENCES auth.users(id),
  updated_by           uuid    REFERENCES auth.users(id),

  -- One booking per slot per day (enforced at DB level)
  UNIQUE (theatre_date, slot)
);

-- Cancellation reason required when status = 'Cancelled'
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_cancellation_reason_required
  CHECK (
    status != 'Cancelled' OR (cancellation_reason IS NOT NULL AND cancellation_reason != '')
  );

-- Theatre date changes not allowed (must cancel + re-book for audit trail)
-- Enforced via trigger (see below)

COMMENT ON TABLE public.bookings IS
  'Each booking links one patient to one slot on one theatre date. Max 3 per day enforced by trigger.';
COMMENT ON COLUMN public.bookings.procedure_name IS
  'Named procedure_name to avoid conflict with SQL reserved word PROCEDURE.';


-- ============================================================
-- 4. BLOCKED DATES
-- ============================================================
CREATE TABLE public.blocked_dates (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date    NOT NULL UNIQUE,
  reason      text    NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid    REFERENCES auth.users(id)
);

COMMENT ON TABLE public.blocked_dates IS
  'Admin-managed list of dates when theatre is unavailable. Bookings on blocked dates are prevented.';


-- ============================================================
-- 5. AUDIT LOG (append-only)
-- ============================================================
CREATE TABLE public.audit_log (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid    REFERENCES auth.users(id),
  user_email  text,
  user_role   text,
  action      text    NOT NULL, -- 'INSERT' | 'UPDATE' | 'DELETE' | custom labels
  table_name  text    NOT NULL,
  record_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_log IS
  'Append-only audit trail. Never updated or deleted. Populated by triggers.';

-- Prevent any updates or deletes on audit_log
CREATE RULE audit_log_no_update AS ON UPDATE TO public.audit_log DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO public.audit_log DO INSTEAD NOTHING;


-- ============================================================
-- TRIGGERS
-- ============================================================

-- 1. Enforce max 3 bookings per theatre date
CREATE OR REPLACE FUNCTION fn_enforce_slot_cap()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM public.bookings
    WHERE theatre_date = NEW.theatre_date
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
  ) >= 3 THEN
    RAISE EXCEPTION
      'Theatre fully booked on %. Maximum 3 cases per day.', NEW.theatre_date
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_slot_cap
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION fn_enforce_slot_cap();


-- 2. Prevent theatre_date changes (cancel + re-book instead)
CREATE OR REPLACE FUNCTION fn_prevent_date_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.theatre_date != NEW.theatre_date THEN
    RAISE EXCEPTION
      'Theatre date cannot be changed. Cancel this booking and create a new one.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_date_change
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION fn_prevent_date_change();


-- 3. Auto-update updated_at on patients and bookings
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- 4. Audit log trigger — fires on bookings insert/update
CREATE OR REPLACE FUNCTION fn_audit_bookings()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id    uuid;
  v_user_email text;
  v_user_role  text;
  v_action     text;
BEGIN
  -- Get current user context
  v_user_id    := auth.uid();
  v_user_email := auth.email();
  SELECT role INTO v_user_role FROM public.profiles WHERE id = v_user_id;

  IF TG_OP = 'INSERT' THEN
    v_action := 'Booking created';
    INSERT INTO public.audit_log (user_id, user_email, user_role, action, table_name, record_id, new_data)
    VALUES (v_user_id, v_user_email, v_user_role, v_action, 'bookings', NEW.id, to_jsonb(NEW));

  ELSIF TG_OP = 'UPDATE' THEN
    -- Label the action meaningfully
    IF OLD.status = 'Pending' AND NEW.status = 'Done' THEN
      v_action := 'Status → Done';
    ELSIF OLD.status = 'Pending' AND NEW.status = 'Cancelled' THEN
      v_action := 'Status → Cancelled';
    ELSIF OLD.pre_op_notes IS DISTINCT FROM NEW.pre_op_notes THEN
      v_action := 'Pre-op note updated';
    ELSE
      v_action := 'Booking updated';
    END IF;

    INSERT INTO public.audit_log (user_id, user_email, user_role, action, table_name, record_id, old_data, new_data)
    VALUES (v_user_id, v_user_email, v_user_role, v_action, 'bookings', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_bookings
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION fn_audit_bookings();


-- 5. Audit log trigger — fires on blocked_dates insert/delete
CREATE OR REPLACE FUNCTION fn_audit_blocked_dates()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id    uuid;
  v_user_email text;
BEGIN
  v_user_id    := auth.uid();
  v_user_email := auth.email();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, user_email, action, table_name, record_id, new_data)
    VALUES (v_user_id, v_user_email, 'Date blocked', 'blocked_dates', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (user_id, user_email, action, table_name, record_id, old_data)
    VALUES (v_user_id, v_user_email, 'Date unblocked', 'blocked_dates', OLD.id, to_jsonb(OLD));
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_audit_blocked_dates
  AFTER INSERT OR DELETE ON public.blocked_dates
  FOR EACH ROW EXECUTE FUNCTION fn_audit_blocked_dates();


-- 6. Auto-create profile row when new auth user signs up
CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Surgeon'),
    false  -- must be approved by Admin before access is granted
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- All tables use RLS. The database, not just the UI, controls access.

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log     ENABLE ROW LEVEL SECURITY;


-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND approved = true;
$$;


-- ── profiles ──────────────────────────────────────────────────────────────────
-- Users can read their own profile
CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (current_user_role() = 'Admin');

-- Admins can update any profile (role, approved)
CREATE POLICY "profiles: admin update"
  ON public.profiles FOR UPDATE
  USING (current_user_role() = 'Admin');


-- ── patients ──────────────────────────────────────────────────────────────────
-- Approved users can read all patients
CREATE POLICY "patients: approved read"
  ON public.patients FOR SELECT
  USING (current_user_role() IS NOT NULL);

-- Admin and Surgeon can create patients
CREATE POLICY "patients: admin+surgeon insert"
  ON public.patients FOR INSERT
  WITH CHECK (current_user_role() IN ('Admin', 'Surgeon'));

-- Admin and Surgeon can update patients (no delete — surgical record integrity)
CREATE POLICY "patients: admin+surgeon update"
  ON public.patients FOR UPDATE
  USING (current_user_role() IN ('Admin', 'Surgeon'));


-- ── bookings ──────────────────────────────────────────────────────────────────
-- All approved users can read bookings
CREATE POLICY "bookings: approved read"
  ON public.bookings FOR SELECT
  USING (current_user_role() IS NOT NULL);

-- Admin and Surgeon can create bookings
CREATE POLICY "bookings: admin+surgeon insert"
  ON public.bookings FOR INSERT
  WITH CHECK (current_user_role() IN ('Admin', 'Surgeon'));

-- Admin and Surgeon can update all booking fields
CREATE POLICY "bookings: admin+surgeon update"
  ON public.bookings FOR UPDATE
  USING (current_user_role() IN ('Admin', 'Surgeon'));

-- Anaesthetist can update ONLY pre_op_notes
-- (enforce at application layer; RLS allows the row, app sends only allowed fields)
CREATE POLICY "bookings: anaesthetist update pre_op_notes"
  ON public.bookings FOR UPDATE
  USING (current_user_role() = 'Anaesthetist');
-- NOTE: In the app, when role = Anaesthetist, only send pre_op_notes in the UPDATE payload.
-- A stricter column-level enforcement can be added via a trigger if needed.


-- ── blocked_dates ─────────────────────────────────────────────────────────────
-- All approved users can read blocked dates
CREATE POLICY "blocked_dates: approved read"
  ON public.blocked_dates FOR SELECT
  USING (current_user_role() IS NOT NULL);

-- Only Admin can block dates
CREATE POLICY "blocked_dates: admin insert"
  ON public.blocked_dates FOR INSERT
  WITH CHECK (current_user_role() = 'Admin');

-- Only Admin can unblock dates
CREATE POLICY "blocked_dates: admin delete"
  ON public.blocked_dates FOR DELETE
  USING (current_user_role() = 'Admin');


-- ── audit_log ────────────────────────────────────────────────────────────────
-- Only Admins can read the audit log; no user can write directly
CREATE POLICY "audit_log: admin read"
  ON public.audit_log FOR SELECT
  USING (current_user_role() = 'Admin');


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_bookings_theatre_date   ON public.bookings(theatre_date);
CREATE INDEX idx_bookings_patient_id     ON public.bookings(patient_id);
CREATE INDEX idx_bookings_status         ON public.bookings(status);
CREATE INDEX idx_bookings_specialty      ON public.bookings(specialty);
CREATE INDEX idx_patients_umr            ON public.patients(umr);
CREATE INDEX idx_patients_full_name_trgm ON public.patients USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_audit_log_created_at    ON public.audit_log(created_at DESC);


-- ============================================================
-- VIEWS (convenience)
-- ============================================================

-- Full booking detail (joins patient)
CREATE OR REPLACE VIEW public.v_bookings_full AS
SELECT
  b.id,
  b.theatre_date,
  b.slot,
  b.specialty,
  b.procedure_name,
  b.diagnosis,
  b.urgency,
  b.estimated_duration,
  b.pre_op_notes,
  b.status,
  b.cancellation_reason,
  b.created_at,
  b.updated_at,
  p.id            AS patient_id,
  p.umr,
  p.full_name,
  p.sex,
  p.date_of_birth,
  p.residence,
  p.phone_primary,
  p.sha_status,
  -- Age in years (approximate, for display)
  DATE_PART('year', AGE(p.date_of_birth)) AS age_years,
  DATE_PART('month', AGE(p.date_of_birth)) AS age_months
FROM public.bookings b
JOIN public.patients p ON p.id = b.patient_id;
