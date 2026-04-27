-- ============================================================
-- Orodha — Redesigned Supabase PostgreSQL Schema
-- Paediatric Theatre Scheduling & Surgical Case Management
-- Version 2.0 draft
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('Admin', 'Surgeon', 'Anaesthetist', 'Nurse', 'Clerk', 'Viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sex_type AS ENUM ('Male', 'Female', 'Other', 'Unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE case_priority AS ENUM ('Elective', 'Semi-urgent', 'Urgent', 'Emergency');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE case_status AS ENUM (
    'Awaiting booking',
    'Booked',
    'Pre-op pending',
    'Cleared for theatre',
    'Done',
    'Postponed',
    'Cancelled',
    'Deferred',
    'Removed from list'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('Booked', 'Done', 'Postponed', 'Cancelled', 'No-show');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE readiness_status AS ENUM ('Not assessed', 'Pending', 'Cleared', 'Not cleared');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sha_status AS ENUM ('Active', 'Inactive', 'Unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- USERS / PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  role        user_role NOT NULL DEFAULT 'Viewer',
  approved    boolean NOT NULL DEFAULT false,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- REFERENCE TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id uuid REFERENCES public.specialties(id),
  name text NOT NULL,
  default_duration_minutes integer CHECK (default_duration_minutes > 0),
  active boolean NOT NULL DEFAULT true,
  UNIQUE (specialty_id, name)
);

CREATE TABLE IF NOT EXISTS public.theatres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  location text,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.theatre_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theatre_id uuid NOT NULL REFERENCES public.theatres(id),
  session_date date NOT NULL,
  session_name text NOT NULL DEFAULT 'Paediatric Surgery List',
  max_cases integer NOT NULL DEFAULT 3 CHECK (max_cases > 0),
  start_time time,
  end_time time,
  is_blocked boolean NOT NULL DEFAULT false,
  block_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE (theatre_id, session_date, session_name)
);

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_number text NOT NULL UNIQUE,
  full_name text NOT NULL,
  sex sex_type NOT NULL DEFAULT 'Unknown',
  date_of_birth date CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE),
  age_text text,
  residence text,
  caregiver_name text,
  phone_primary text,
  phone_secondary text,
  sha_status sha_status NOT NULL DEFAULT 'Unknown',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_patients_name_trgm ON public.patients USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_hospital_number ON public.patients(hospital_number);

-- ============================================================
-- SURGICAL CASES
-- One patient can have multiple surgical cases over time.
-- A case can be booked, postponed, rebooked, and eventually completed.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.surgical_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  specialty_id uuid REFERENCES public.specialties(id),
  procedure_id uuid REFERENCES public.procedures(id),
  procedure_name text NOT NULL,
  diagnosis text,
  indication text,
  case_description text,
  priority case_priority NOT NULL DEFAULT 'Elective',
  status case_status NOT NULL DEFAULT 'Awaiting booking',
  estimated_duration_minutes integer CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0),
  weight_kg numeric(5,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  asa_class text CHECK (asa_class IS NULL OR asa_class IN ('I','II','III','IV','V')),
  comorbidities text,
  allergies text,
  special_requirements text,
  surgeon_id uuid REFERENCES public.profiles(id),
  anaesthetist_id uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_cases_patient_id ON public.surgical_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.surgical_cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON public.surgical_cases(priority);

-- ============================================================
-- PRE-OP READINESS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.preop_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL UNIQUE REFERENCES public.surgical_cases(id) ON DELETE CASCADE,
  anaesthesia_status readiness_status NOT NULL DEFAULT 'Not assessed',
  surgical_status readiness_status NOT NULL DEFAULT 'Not assessed',
  nursing_status readiness_status NOT NULL DEFAULT 'Not assessed',
  consent_done boolean NOT NULL DEFAULT false,
  fasting_instructions_given boolean NOT NULL DEFAULT false,
  labs_required boolean NOT NULL DEFAULT false,
  labs_done boolean NOT NULL DEFAULT false,
  imaging_required boolean NOT NULL DEFAULT false,
  imaging_done boolean NOT NULL DEFAULT false,
  blood_required boolean NOT NULL DEFAULT false,
  blood_available boolean NOT NULL DEFAULT false,
  financial_clearance boolean NOT NULL DEFAULT false,
  preop_notes text,
  assessed_at timestamptz,
  assessed_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- BOOKINGS
-- Each scheduled theatre appearance is a booking.
-- Rebooking creates a new row while preserving the old one.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.surgical_cases(id),
  session_id uuid NOT NULL REFERENCES public.theatre_sessions(id),
  slot integer NOT NULL CHECK (slot > 0),
  booking_status booking_status NOT NULL DEFAULT 'Booked',
  order_on_list integer CHECK (order_on_list IS NULL OR order_on_list > 0),
  postop_destination text CHECK (postop_destination IS NULL OR postop_destination IN ('Ward','HDU','ICU','Day case','Other')),
  cancellation_reason text,
  postponement_reason text,
  outcome_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE (session_id, slot),
  UNIQUE (session_id, order_on_list)
);

CREATE INDEX IF NOT EXISTS idx_bookings_case_id ON public.bookings(case_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON public.bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);

-- ============================================================
-- NOTES AND AUDIT
-- ============================================================
CREATE TABLE IF NOT EXISTS public.case_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.surgical_cases(id) ON DELETE CASCADE,
  note_type text NOT NULL DEFAULT 'General',
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON public.surgical_cases
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_preop_updated_at BEFORE UPDATE ON public.preop_assessments
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Prevent booking into blocked sessions
CREATE OR REPLACE FUNCTION public.fn_prevent_blocked_session_booking()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.theatre_sessions WHERE id = NEW.session_id AND is_blocked = true) THEN
    RAISE EXCEPTION 'Cannot book into a blocked theatre session.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_blocked_session_booking
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_blocked_session_booking();

-- Enforce max cases per session
CREATE OR REPLACE FUNCTION public.fn_enforce_session_capacity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_max_cases integer;
  v_count integer;
BEGIN
  SELECT max_cases INTO v_max_cases FROM public.theatre_sessions WHERE id = NEW.session_id;

  SELECT COUNT(*) INTO v_count
  FROM public.bookings
  WHERE session_id = NEW.session_id
    AND booking_status = 'Booked'
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000');

  IF NEW.booking_status = 'Booked' AND v_count >= v_max_cases THEN
    RAISE EXCEPTION 'This theatre session is already full. Maximum cases: %', v_max_cases;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_session_capacity
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_session_capacity();

-- Require reason for cancelled/postponed bookings
CREATE OR REPLACE FUNCTION public.fn_require_booking_reason()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.booking_status = 'Cancelled' AND COALESCE(NEW.cancellation_reason, '') = '' THEN
    RAISE EXCEPTION 'Cancellation reason is required.';
  END IF;
  IF NEW.booking_status = 'Postponed' AND COALESCE(NEW.postponement_reason, '') = '' THEN
    RAISE EXCEPTION 'Postponement reason is required.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_require_booking_reason
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.fn_require_booking_reason();

-- Auto-create preop checklist for every new surgical case
CREATE OR REPLACE FUNCTION public.fn_create_preop_assessment()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.preop_assessments(case_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_preop_assessment
AFTER INSERT ON public.surgical_cases
FOR EACH ROW EXECUTE FUNCTION public.fn_create_preop_assessment();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'Viewer'),
    false
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_user();

-- ============================================================
-- RLS HELPERS
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theatres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theatre_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preop_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND approved = true;
$$;

CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approved = true);
$$;

-- Basic RLS policies
CREATE POLICY "profiles read own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles admin all" ON public.profiles FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');

CREATE POLICY "reference read approved" ON public.specialties FOR SELECT USING (public.is_approved_user());
CREATE POLICY "reference admin write" ON public.specialties FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');
CREATE POLICY "procedures read approved" ON public.procedures FOR SELECT USING (public.is_approved_user());
CREATE POLICY "procedures admin write" ON public.procedures FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');
CREATE POLICY "theatres read approved" ON public.theatres FOR SELECT USING (public.is_approved_user());
CREATE POLICY "theatres admin write" ON public.theatres FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');
CREATE POLICY "sessions read approved" ON public.theatre_sessions FOR SELECT USING (public.is_approved_user());
CREATE POLICY "sessions admin write" ON public.theatre_sessions FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');

CREATE POLICY "patients read approved" ON public.patients FOR SELECT USING (public.is_approved_user());
CREATE POLICY "patients admin write" ON public.patients FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');

CREATE POLICY "cases read approved" ON public.surgical_cases FOR SELECT USING (public.is_approved_user());
CREATE POLICY "cases admin write" ON public.surgical_cases FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');

CREATE POLICY "preop read approved" ON public.preop_assessments FOR SELECT USING (public.is_approved_user());
CREATE POLICY "preop admin write" ON public.preop_assessments FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');

CREATE POLICY "bookings read approved" ON public.bookings FOR SELECT USING (public.is_approved_user());
CREATE POLICY "bookings admin write" ON public.bookings FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');

CREATE POLICY "notes read approved" ON public.case_notes FOR SELECT USING (public.is_approved_user());
CREATE POLICY "notes admin write" ON public.case_notes FOR ALL USING (public.current_user_role() = 'Admin') WITH CHECK (public.current_user_role() = 'Admin');

CREATE POLICY "audit admin read" ON public.audit_log FOR SELECT USING (public.current_user_role() = 'Admin');

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW public.v_theatre_list AS
SELECT
  b.id AS booking_id,
  ts.session_date AS theatre_date,
  t.name AS theatre,
  ts.session_name,
  b.slot,
  b.order_on_list,
  b.booking_status,
  p.hospital_number,
  p.full_name,
  p.sex,
  p.date_of_birth,
  DATE_PART('year', AGE(p.date_of_birth)) AS age_years,
  sc.weight_kg,
  sc.asa_class,
  sp.name AS specialty,
  sc.procedure_name,
  sc.diagnosis,
  sc.priority,
  pa.anaesthesia_status,
  pa.surgical_status,
  pa.nursing_status,
  pa.consent_done,
  pa.labs_done,
  pa.blood_available,
  sc.special_requirements,
  b.postop_destination,
  p.phone_primary
FROM public.bookings b
JOIN public.surgical_cases sc ON sc.id = b.case_id
JOIN public.patients p ON p.id = sc.patient_id
JOIN public.theatre_sessions ts ON ts.id = b.session_id
JOIN public.theatres t ON t.id = ts.theatre_id
LEFT JOIN public.specialties sp ON sp.id = sc.specialty_id
LEFT JOIN public.preop_assessments pa ON pa.case_id = sc.id;

CREATE OR REPLACE VIEW public.v_calendar_capacity AS
SELECT
  ts.id AS session_id,
  ts.session_date,
  t.name AS theatre,
  ts.session_name,
  ts.max_cases,
  ts.is_blocked,
  ts.block_reason,
  COUNT(b.id) FILTER (WHERE b.booking_status = 'Booked') AS booked_cases,
  ts.max_cases - COUNT(b.id) FILTER (WHERE b.booking_status = 'Booked') AS available_slots
FROM public.theatre_sessions ts
JOIN public.theatres t ON t.id = ts.theatre_id
LEFT JOIN public.bookings b ON b.session_id = ts.id
GROUP BY ts.id, ts.session_date, t.name, ts.session_name, ts.max_cases, ts.is_blocked, ts.block_reason;

-- ============================================================
-- SEED REFERENCE DATA
-- ============================================================
INSERT INTO public.specialties(name) VALUES
  ('Urological'), ('Colorectal'), ('Hernias & Testis'), ('Upper GI'),
  ('Hepatobiliary'), ('Minor Procedures'), ('Oncological'), ('Other')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.theatres(name, location) VALUES
  ('Main Paediatric Theatre', 'Main theatre block')
ON CONFLICT (name) DO NOTHING;
