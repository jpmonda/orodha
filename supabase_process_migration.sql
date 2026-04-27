-- Orodha process hardening migration.
-- Run after orodha_redesigned_schema.sql.
--
-- Goals:
-- 1. Keep booking history immutable during postponement/rebooking workflows.
-- 2. Populate audit_log automatically for core operational tables.
-- 3. Add a joined read view for app screens.

CREATE OR REPLACE FUNCTION public.fn_audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record_id uuid;
BEGIN
  v_record_id := COALESCE(NEW.id, OLD.id);

  INSERT INTO public.audit_log (
    user_id,
    user_email,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  )
  VALUES (
    auth.uid(),
    auth.jwt() ->> 'email',
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_patients ON public.patients;
CREATE TRIGGER trg_audit_patients
AFTER INSERT OR UPDATE OR DELETE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_surgical_cases ON public.surgical_cases;
CREATE TRIGGER trg_audit_surgical_cases
AFTER INSERT OR UPDATE OR DELETE ON public.surgical_cases
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_preop_assessments ON public.preop_assessments;
CREATE TRIGGER trg_audit_preop_assessments
AFTER INSERT OR UPDATE OR DELETE ON public.preop_assessments
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_theatre_sessions ON public.theatre_sessions;
CREATE TRIGGER trg_audit_theatre_sessions
AFTER INSERT OR UPDATE OR DELETE ON public.theatre_sessions
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_bookings ON public.bookings;
CREATE TRIGGER trg_audit_bookings
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_case_notes ON public.case_notes;
CREATE TRIGGER trg_audit_case_notes
AFTER INSERT OR UPDATE OR DELETE ON public.case_notes
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row_change();

CREATE OR REPLACE VIEW public.v_bookings_full AS
SELECT
  b.id AS booking_id,
  b.case_id,
  b.session_id,
  b.slot,
  b.order_on_list,
  b.booking_status,
  b.postop_destination,
  b.cancellation_reason,
  b.postponement_reason,
  b.outcome_notes,
  b.created_at AS booking_created_at,
  b.updated_at AS booking_updated_at,
  ts.session_date,
  ts.session_name,
  ts.max_cases,
  ts.is_blocked,
  ts.block_reason,
  t.id AS theatre_id,
  t.name AS theatre_name,
  p.id AS patient_id,
  p.hospital_number,
  p.full_name,
  p.sex,
  p.date_of_birth,
  p.age_text,
  p.residence,
  p.phone_primary,
  p.sha_status,
  sc.procedure_name,
  sc.diagnosis,
  sc.priority,
  sc.status AS case_status,
  sc.estimated_duration_minutes,
  sc.weight_kg,
  sc.asa_class,
  sp.id AS specialty_id,
  sp.name AS specialty,
  pa.anaesthesia_status,
  pa.surgical_status,
  pa.nursing_status,
  pa.consent_done,
  pa.fasting_instructions_given,
  pa.labs_required,
  pa.labs_done,
  pa.imaging_required,
  pa.imaging_done,
  pa.blood_required,
  pa.blood_available,
  pa.financial_clearance,
  pa.preop_notes
FROM public.bookings b
JOIN public.surgical_cases sc ON sc.id = b.case_id
JOIN public.patients p ON p.id = sc.patient_id
JOIN public.theatre_sessions ts ON ts.id = b.session_id
JOIN public.theatres t ON t.id = ts.theatre_id
LEFT JOIN public.specialties sp ON sp.id = sc.specialty_id
LEFT JOIN public.preop_assessments pa ON pa.case_id = sc.id;

CREATE OR REPLACE FUNCTION public.postpone_and_rebook(
  p_booking_id uuid,
  p_new_session_id uuid,
  p_new_slot integer,
  p_reason text,
  p_postop_destination text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old public.bookings%ROWTYPE;
  v_new_booking_id uuid;
BEGIN
  IF COALESCE(p_reason, '') = '' THEN
    RAISE EXCEPTION 'Postponement reason is required.';
  END IF;

  SELECT * INTO v_old
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found.';
  END IF;

  UPDATE public.bookings
  SET booking_status = 'Postponed',
      postponement_reason = p_reason,
      updated_by = auth.uid(),
      updated_at = now()
  WHERE id = p_booking_id;

  INSERT INTO public.bookings (
    case_id,
    session_id,
    slot,
    booking_status,
    order_on_list,
    postop_destination,
    created_by
  )
  VALUES (
    v_old.case_id,
    p_new_session_id,
    p_new_slot,
    'Booked',
    p_new_slot,
    COALESCE(p_postop_destination, v_old.postop_destination),
    auth.uid()
  )
  RETURNING id INTO v_new_booking_id;

  UPDATE public.surgical_cases
  SET status = 'Booked',
      updated_by = auth.uid(),
      updated_at = now()
  WHERE id = v_old.case_id;

  RETURN v_new_booking_id;
END;
$$;
