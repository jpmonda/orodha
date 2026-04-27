-- Orodha demo data for the redesigned schema.
-- Run after orodha_redesigned_schema.sql in Supabase SQL Editor.

INSERT INTO public.specialties(id, name, active) VALUES
  ('00000000-0000-0000-0000-000000000101', 'Urological', true),
  ('00000000-0000-0000-0000-000000000102', 'Colorectal', true),
  ('00000000-0000-0000-0000-000000000103', 'Hernias & Testis', true),
  ('00000000-0000-0000-0000-000000000104', 'Upper GI', true),
  ('00000000-0000-0000-0000-000000000105', 'Hepatobiliary', true),
  ('00000000-0000-0000-0000-000000000106', 'Minor Procedures', true),
  ('00000000-0000-0000-0000-000000000107', 'Oncological', true),
  ('00000000-0000-0000-0000-000000000108', 'Other', true)
ON CONFLICT (name) DO UPDATE SET active = EXCLUDED.active;

INSERT INTO public.theatres(id, name, location, active) VALUES
  ('00000000-0000-0000-0000-000000000201', 'Main Paediatric Theatre', 'Main theatre block', true),
  ('00000000-0000-0000-0000-000000000202', 'Day Surgery Theatre', 'Ambulatory wing', true)
ON CONFLICT (name) DO UPDATE SET location = EXCLUDED.location, active = EXCLUDED.active;

INSERT INTO public.procedures(id, specialty_id, name, default_duration_minutes, active) VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', 'Pyeloplasty', 150, true),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000102', 'Pull-through Procedure', 180, true),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000103', 'Inguinal Hernia Repair', 75, true),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000105', 'Hepatoportoenterostomy', 240, true)
ON CONFLICT (specialty_id, name) DO UPDATE SET default_duration_minutes = EXCLUDED.default_duration_minutes, active = EXCLUDED.active;

INSERT INTO public.theatre_sessions(id, theatre_id, session_date, session_name, max_cases, start_time, end_time, is_blocked, block_reason, notes) VALUES
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', '2026-04-28', 'Paediatric Surgery List', 3, '08:00', '16:00', false, null, null),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000201', '2026-04-29', 'Paediatric Surgery List', 3, '08:00', '16:00', false, null, 'Full day list'),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000201', '2026-05-01', 'Paediatric Surgery List', 3, null, null, true, 'Labour Day - public holiday', null),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000201', '2026-05-05', 'Paediatric Surgery List', 4, '08:00', '16:00', false, null, null)
ON CONFLICT (id) DO UPDATE SET max_cases = EXCLUDED.max_cases, is_blocked = EXCLUDED.is_blocked, block_reason = EXCLUDED.block_reason, notes = EXCLUDED.notes;

INSERT INTO public.patients(id, hospital_number, full_name, sex, date_of_birth, residence, caregiver_name, phone_primary, sha_status) VALUES
  ('00000000-0000-0000-0000-000000000501', 'UMR0482156', 'Amara Wanjiku Kamau', 'Female', '2019-03-15', 'Nairobi', 'Mary Kamau', '0712345678', 'Active'),
  ('00000000-0000-0000-0000-000000000502', 'UMR0174803', 'David Otieno Odhiambo', 'Male', '2021-07-22', 'Kisumu', 'Peter Odhiambo', '0723456789', 'Active'),
  ('00000000-0000-0000-0000-000000000503', 'UMR0231256', 'Faith Njeri Mwangi', 'Female', '2018-11-08', 'Thika', 'Jane Mwangi', '0734567890', 'Inactive'),
  ('00000000-0000-0000-0000-000000000504', 'UMR0395841', 'Michael Kipchoge Langat', 'Male', '2020-04-30', 'Eldoret', 'Daniel Langat', '0745678901', 'Active'),
  ('00000000-0000-0000-0000-000000000505', 'UMR0156234', 'Grace Achieng Owino', 'Female', '2022-01-14', 'Mombasa', 'Rose Owino', '0756789012', 'Active')
ON CONFLICT (hospital_number) DO UPDATE SET full_name = EXCLUDED.full_name, phone_primary = EXCLUDED.phone_primary, sha_status = EXCLUDED.sha_status;

INSERT INTO public.surgical_cases(id, patient_id, specialty_id, procedure_id, procedure_name, diagnosis, indication, priority, status, estimated_duration_minutes, weight_kg, asa_class, allergies, special_requirements) VALUES
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', 'Pyeloplasty', 'UPJO', 'Progressive hydronephrosis', 'Elective', 'Booked', 150, 13.4, 'II', 'Nil known', 'MAG3 renogram reviewed'),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000302', 'Pull-through Procedure', 'Hirschsprung disease', 'Definitive repair', 'Elective', 'Booked', 180, 16.2, 'II', null, 'Biopsy confirmed aganglionosis to sigmoid'),
  ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000303', 'Bilateral Inguinal Hernia Repair', 'Bilateral inguinal hernias', 'Reducible hernias', 'Elective', 'Awaiting booking', 90, 19.1, 'I', null, null),
  ('00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000304', 'Hepatoportoenterostomy', 'Biliary atresia', 'Persistent cholestasis', 'Urgent', 'Postponed', 240, 21.6, 'III', null, 'ICU alerted'),
  ('00000000-0000-0000-0000-000000000605', '00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000106', null, 'Circumcision', 'Phimosis', 'Recurrent balanitis', 'Elective', 'Done', 45, 18.8, 'I', null, null)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, procedure_name = EXCLUDED.procedure_name, diagnosis = EXCLUDED.diagnosis;

UPDATE public.preop_assessments SET
  anaesthesia_status = 'Cleared',
  surgical_status = 'Cleared',
  nursing_status = 'Pending',
  consent_done = true,
  fasting_instructions_given = true,
  labs_required = true,
  labs_done = true,
  imaging_required = true,
  imaging_done = true,
  financial_clearance = true,
  preop_notes = 'MAG3 renogram done. Parent counselled.'
WHERE case_id = '00000000-0000-0000-0000-000000000601';

UPDATE public.preop_assessments SET
  anaesthesia_status = 'Pending',
  surgical_status = 'Cleared',
  nursing_status = 'Pending',
  consent_done = true,
  labs_required = true,
  blood_required = true,
  financial_clearance = true,
  preop_notes = 'Bowel prep plan to confirm.'
WHERE case_id = '00000000-0000-0000-0000-000000000602';

INSERT INTO public.bookings(id, case_id, session_id, slot, booking_status, order_on_list, postop_destination, postponement_reason, outcome_notes) VALUES
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000401', 1, 'Booked', 1, 'Ward', null, null),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000402', 1, 'Booked', 1, 'HDU', null, null),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000402', 2, 'Postponed', 2, 'ICU', 'No ICU bed available', null),
  ('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000404', 1, 'Booked', 1, 'ICU', null, null),
  ('00000000-0000-0000-0000-000000000705', '00000000-0000-0000-0000-000000000605', '00000000-0000-0000-0000-000000000402', 3, 'Done', 3, 'Day case', null, 'Discharged to ward stable.')
ON CONFLICT (id) DO UPDATE SET booking_status = EXCLUDED.booking_status, postponement_reason = EXCLUDED.postponement_reason, outcome_notes = EXCLUDED.outcome_notes;

INSERT INTO public.case_notes(id, case_id, note_type, note) VALUES
  ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000601', 'Pre-op', 'Parents counselled and consent signed.'),
  ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000604', 'Booking', 'Original booking postponed; rebooked without losing history.')
ON CONFLICT (id) DO UPDATE SET note = EXCLUDED.note;
