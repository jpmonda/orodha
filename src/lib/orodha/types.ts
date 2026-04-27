export type Sex = "Male" | "Female" | "Other" | "Unknown";

export type CasePriority = "Elective" | "Semi-urgent" | "Urgent" | "Emergency";

export type CaseStatus =
  | "Awaiting booking"
  | "Booked"
  | "Pre-op pending"
  | "Cleared for theatre"
  | "Done"
  | "Postponed"
  | "Cancelled"
  | "Deferred"
  | "Removed from list";

export type BookingStatus = "Booked" | "Done" | "Postponed" | "Cancelled" | "No-show";

export type ReadinessStatus = "Not assessed" | "Pending" | "Cleared" | "Not cleared";

export type ShaStatus = "Active" | "Inactive" | "Unknown";
export type UserRole = "Admin" | "Surgeon" | "Anaesthetist" | "Nurse" | "Clerk" | "Viewer";

export interface Specialty {
  id: string;
  name: string;
  active: boolean;
}

export interface ProcedureRef {
  id: string;
  specialty_id: string | null;
  name: string;
  default_duration_minutes: number | null;
  active: boolean;
}

export interface Theatre {
  id: string;
  name: string;
  location: string | null;
  active: boolean;
}

export interface TheatreSession {
  id: string;
  theatre_id: string;
  session_date: string;
  session_name: string;
  max_cases: number;
  start_time: string | null;
  end_time: string | null;
  is_blocked: boolean;
  block_reason: string | null;
  notes: string | null;
  created_at: string;
}

export interface Patient {
  id: string;
  hospital_number: string;
  full_name: string;
  sex: Sex;
  date_of_birth: string | null;
  age_text: string | null;
  residence: string | null;
  caregiver_name: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  sha_status: ShaStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurgicalCase {
  id: string;
  patient_id: string;
  specialty_id: string | null;
  procedure_id: string | null;
  procedure_name: string;
  diagnosis: string | null;
  indication: string | null;
  case_description: string | null;
  priority: CasePriority;
  status: CaseStatus;
  estimated_duration_minutes: number | null;
  weight_kg: number | null;
  asa_class: "I" | "II" | "III" | "IV" | "V" | null;
  comorbidities: string | null;
  allergies: string | null;
  special_requirements: string | null;
  surgeon_id: string | null;
  anaesthetist_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreopAssessment {
  id: string;
  case_id: string;
  anaesthesia_status: ReadinessStatus;
  surgical_status: ReadinessStatus;
  nursing_status: ReadinessStatus;
  consent_done: boolean;
  fasting_instructions_given: boolean;
  labs_required: boolean;
  labs_done: boolean;
  imaging_required: boolean;
  imaging_done: boolean;
  blood_required: boolean;
  blood_available: boolean;
  financial_clearance: boolean;
  preop_notes: string | null;
  assessed_at: string | null;
  updated_at: string;
}

export interface Booking {
  id: string;
  case_id: string;
  session_id: string;
  slot: number;
  booking_status: BookingStatus;
  order_on_list: number | null;
  postop_destination: "Ward" | "HDU" | "ICU" | "Day case" | "Other" | null;
  cancellation_reason: string | null;
  postponement_reason: string | null;
  outcome_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseNote {
  id: string;
  case_id: string;
  note_type: string;
  note: string;
  created_at: string;
}

export interface OrodhaData {
  specialties: Specialty[];
  procedures: ProcedureRef[];
  theatres: Theatre[];
  theatre_sessions: TheatreSession[];
  patients: Patient[];
  surgical_cases: SurgicalCase[];
  preop_assessments: PreopAssessment[];
  bookings: Booking[];
  case_notes: CaseNote[];
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  approved: boolean;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrichedBooking extends Booking {
  session: TheatreSession;
  theatre: Theatre;
  surgicalCase: SurgicalCase;
  patient: Patient;
  specialty: Specialty | null;
  preop: PreopAssessment | null;
}
