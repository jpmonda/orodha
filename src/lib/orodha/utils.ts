import { differenceInMonths, format, parseISO } from "date-fns";
import type { Booking, EnrichedBooking, OrodhaData, PreopAssessment, SurgicalCase, TheatreSession } from "./types";

export function createId(prefix: string) {
  void prefix;
  return crypto.randomUUID();
}

export function todayIso() {
  return new Date().toISOString();
}

export function formatDate(value: string) {
  return format(parseISO(value), "EEE, d MMM yyyy");
}

export function childAge(dateOfBirth: string | null, fallback?: string | null) {
  if (!dateOfBirth) return fallback || "Age not recorded";
  const months = differenceInMonths(new Date("2026-04-26"), parseISO(dateOfBirth));
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years <= 0) return `${Math.max(rem, 0)} mo`;
  return rem ? `${years}y ${rem}mo` : `${years}y`;
}

export function enrichBookings(data: OrodhaData): EnrichedBooking[] {
  return data.bookings
    .map((booking) => {
      const surgicalCase = data.surgical_cases.find((item) => item.id === booking.case_id);
      const patient = data.patients.find((item) => item.id === surgicalCase?.patient_id);
      const session = data.theatre_sessions.find((item) => item.id === booking.session_id);
      const theatre = data.theatres.find((item) => item.id === session?.theatre_id);
      if (!surgicalCase || !patient || !session || !theatre) return null;
      return {
        ...booking,
        surgicalCase,
        patient,
        session,
        theatre,
        specialty: data.specialties.find((item) => item.id === surgicalCase.specialty_id) || null,
        preop: data.preop_assessments.find((item) => item.case_id === surgicalCase.id) || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const dateDiff = a!.session.session_date.localeCompare(b!.session.session_date);
      return dateDiff || (a!.order_on_list || a!.slot) - (b!.order_on_list || b!.slot);
    }) as EnrichedBooking[];
}

export function bookingsForSession(data: OrodhaData, sessionId: string) {
  return enrichBookings(data).filter((booking) => booking.session_id === sessionId);
}

export function capacityForSession(data: OrodhaData, session: TheatreSession) {
  const booked = data.bookings.filter(
    (booking) =>
      booking.session_id === session.id &&
      ["Booked", "Done", "No-show"].includes(booking.booking_status),
  ).length;
  return {
    booked,
    available: Math.max(session.max_cases - booked, 0),
    isFull: booked >= session.max_cases,
    percent: Math.min(Math.round((booked / session.max_cases) * 100), 100),
  };
}

export function readinessScore(preop: PreopAssessment | null) {
  if (!preop) return 0;
  const items = [
    preop.anaesthesia_status === "Cleared",
    preop.surgical_status === "Cleared",
    preop.nursing_status === "Cleared",
    preop.consent_done,
    !preop.labs_required || preop.labs_done,
    !preop.imaging_required || preop.imaging_done,
    !preop.blood_required || preop.blood_available,
    preop.financial_clearance,
  ];
  return Math.round((items.filter(Boolean).length / items.length) * 100);
}

export function applyCaseStatusFromBooking(booking: Booking, surgicalCase: SurgicalCase): SurgicalCase {
  const statusMap = {
    Booked: "Booked",
    Done: "Done",
    Postponed: "Postponed",
    Cancelled: "Cancelled",
    "No-show": "Postponed",
  } as const;
  return { ...surgicalCase, status: statusMap[booking.booking_status], updated_at: todayIso() };
}
