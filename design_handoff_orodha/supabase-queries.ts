// ============================================================
// Orodha — TypeScript Types + Supabase Query Hooks
// ============================================================
// Copy into src/hooks/ and src/lib/types.ts as needed.
// Requires: @supabase/supabase-js, @tanstack/react-query
// ============================================================

import { supabase } from '../lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'


// ============================================================
// TYPES  (src/lib/types.ts)
// ============================================================

export type UserRole = 'Admin' | 'Surgeon' | 'Anaesthetist'
export type Sex      = 'Male' | 'Female'
export type Urgency  = 'Elective' | 'Urgent' | 'Emergency'
export type BookingStatus = 'Pending' | 'Done' | 'Cancelled'
export type SHAStatus     = 'Active' | 'Inactive'

export type Specialty =
  | 'Urological'
  | 'Colorectal'
  | 'Hernias & Testis'
  | 'Upper GI'
  | 'Hepatobiliary'
  | 'Minor Procedures'
  | 'Oncological'
  | 'Other'

export const SPECIALTIES: Specialty[] = [
  'Urological', 'Colorectal', 'Hernias & Testis', 'Upper GI',
  'Hepatobiliary', 'Minor Procedures', 'Oncological', 'Other',
]

export const CANCELLATION_REASONS = [
  'Patient unfit for surgery',
  'Upper respiratory tract infection (URTI)',
  'No-show / did not attend',
  'Fasting failure',
  'Theatre overrun',
  'Equipment unavailable',
  'Surgeon unavailable',
  'Other',
] as const

export type CancellationReason = typeof CANCELLATION_REASONS[number]

// ── Database row types ────────────────────────────────────────────────────────

export interface Profile {
  id:         string
  full_name:  string
  role:       UserRole
  approved:   boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id:              string
  umr:             string
  full_name:       string
  sex:             Sex
  date_of_birth:   string   // ISO date string 'YYYY-MM-DD'
  residence:       string | null
  phone_primary:   string
  phone_secondary: string | null
  sha_status:      SHAStatus
  created_at:      string
  updated_at:      string
  created_by:      string | null
}

export interface Booking {
  id:                  string
  patient_id:          string
  theatre_date:        string   // 'YYYY-MM-DD'
  slot:                1 | 2 | 3
  specialty:           Specialty
  procedure_name:      string
  diagnosis:           string | null
  case_description:    string | null
  urgency:             Urgency
  estimated_duration:  number | null
  pre_op_notes:        string | null
  status:              BookingStatus
  cancellation_reason: string | null
  created_at:          string
  updated_at:          string
  created_by:          string | null
  updated_by:          string | null
}

export interface BlockedDate {
  id:         string
  date:       string  // 'YYYY-MM-DD'
  reason:     string
  created_at: string
  created_by: string | null
}

export interface AuditLogEntry {
  id:         string
  user_id:    string | null
  user_email: string | null
  user_role:  string | null
  action:     string
  table_name: string
  record_id:  string | null
  old_data:   Record<string, unknown> | null
  new_data:   Record<string, unknown> | null
  created_at: string
}

// ── Joined view type (v_bookings_full) ───────────────────────────────────────
export interface BookingFull extends Booking {
  umr:           string
  full_name:     string
  sex:           Sex
  date_of_birth: string
  residence:     string | null
  phone_primary: string
  sha_status:    SHAStatus
  age_years:     number
  age_months:    number
}

// ── Form input types ──────────────────────────────────────────────────────────
export interface PatientFormData {
  umr:             string
  full_name:       string
  sex:             Sex | ''
  date_of_birth:   string
  residence:       string
  phone_primary:   string
  phone_secondary: string
  sha_status:      SHAStatus
}

export interface BookingFormData {
  patient_id:         string
  theatre_date:       string
  slot:               string   // '1' | '2' | '3' | ''
  specialty:          Specialty | ''
  procedure_name:     string
  diagnosis:          string
  urgency:            Urgency
  estimated_duration: string
  pre_op_notes:       string
}


// ============================================================
// HOOKS
// ============================================================

// ── useAuth  (src/hooks/useAuth.ts) ──────────────────────────────────────────
export function useAuth() {
  const [session, setSession] = React.useState(null)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    isAdmin: profile?.role === 'Admin',
    isSurgeon: profile?.role === 'Surgeon',
    isAnaesthetist: profile?.role === 'Anaesthetist',
    approved: profile?.approved ?? false,
    loading,
    signIn,
    signOut,
  }
}


// ── useBookings  (src/hooks/useBookings.ts) ──────────────────────────────────

// Fetch all bookings for a given year (default 2026)
export function useBookings(year = 2026) {
  return useQuery({
    queryKey: ['bookings', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_bookings_full')
        .select('*')
        .gte('theatre_date', `${year}-01-01`)
        .lte('theatre_date', `${year}-12-31`)
        .order('theatre_date', { ascending: true })
        .order('slot',         { ascending: true })
      if (error) throw error
      return data as BookingFull[]
    },
    staleTime: 30_000,
  })
}

// Fetch bookings for a single date
export function useBookingsForDate(date: string) {
  return useQuery({
    queryKey: ['bookings', 'date', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_bookings_full')
        .select('*')
        .eq('theatre_date', date)
        .order('slot', { ascending: true })
      if (error) throw error
      return data as BookingFull[]
    },
    enabled: !!date,
  })
}

// Fetch bookings for a specialty
export function useBookingsBySpecialty(specialty: Specialty) {
  return useQuery({
    queryKey: ['bookings', 'specialty', specialty],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_bookings_full')
        .select('*')
        .eq('specialty', specialty)
        .order('theatre_date', { ascending: true })
      if (error) throw error
      return data as BookingFull[]
    },
  })
}

// Create a booking
export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'status' | 'cancellation_reason'>) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert({ ...payload, status: 'Pending' })
        .select()
        .single()
      if (error) {
        // Surface DB-level slot cap error clearly
        if (error.message.includes('Maximum 3 cases')) {
          throw new Error(`Theatre fully booked on ${payload.theatre_date}. Maximum 3 cases per day.`)
        }
        throw error
      }
      return data as Booking
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking confirmed.')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

// Mark booking as Done
export function useMarkDone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Done' })
        .eq('id', bookingId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Marked as Done.')
    },
    onError: () => toast.error('Failed to update status.'),
  })
}

// Cancel booking with reason
export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Cancelled', cancellation_reason: reason })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking cancelled.')
    },
    onError: () => toast.error('Failed to cancel booking.'),
  })
}

// Update pre-op notes (Anaesthetist + Admin + Surgeon)
export function useUpdatePreOpNotes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ pre_op_notes: notes })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Pre-op notes saved.')
    },
  })
}


// ── usePatients  (src/hooks/usePatients.ts) ──────────────────────────────────

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name', { ascending: true })
      if (error) throw error
      return data as Patient[]
    },
  })
}

// Search patients by name or UMR (debounce in component)
export function usePatientSearch(query: string) {
  return useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`full_name.ilike.%${query}%,umr.ilike.%${query}%`)
        .limit(10)
      if (error) throw error
      return data as Patient[]
    },
    enabled: query.length >= 2,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('patients')
        .insert(payload)
        .select()
        .single()
      if (error) {
        if (error.code === '23505') throw new Error(`UMR ${payload.umr} already exists in the registry.`)
        throw error
      }
      return data as Patient
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient record created.')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<Patient> & { id: string }) => {
      const { error } = await supabase.from('patients').update(fields).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient record updated.')
    },
  })
}


// ── useBlockedDates  (src/hooks/useBlockedDates.ts) ──────────────────────────

export function useBlockedDates() {
  return useQuery({
    queryKey: ['blocked-dates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date', { ascending: true })
      if (error) throw error
      return data as BlockedDate[]
    },
  })
}

export function useBlockDate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ date, reason }: { date: string; reason: string }) => {
      const { error } = await supabase.from('blocked_dates').insert({ date, reason })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Date blocked.')
    },
    onError: () => toast.error('Failed to block date.'),
  })
}

export function useUnblockDate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase.from('blocked_dates').delete().eq('date', date)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] })
      toast.success('Date unblocked.')
    },
  })
}


// ── useAuditLog  (src/hooks/useAuditLog.ts) ──────────────────────────────────

export function useAuditLog(limit = 50) {
  return useQuery({
    queryKey: ['audit-log', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as AuditLogEntry[]
    },
  })
}


// ── Utility: calcAge  (src/lib/utils.ts) ─────────────────────────────────────

export function calcAge(dob: string): string {
  const birth = new Date(dob)
  const now   = new Date()
  let years   = now.getFullYear() - birth.getFullYear()
  let months  = now.getMonth()    - birth.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years === 0) return `${months}mo`
  if (months === 0) return `${years}y`
  return `${years}y ${months}mo`
}

export function formatDate(date: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', opts ?? {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function isWeekend(date: string): boolean {
  const d = new Date(date + 'T00:00:00').getDay()
  return d === 0 || d === 6
}

// Tailwind classes for booking count cells
export function slotCountClasses(count: number, blocked: boolean): string {
  if (blocked) return 'bg-slate-100 text-slate-500 border-slate-200'
  if (count === 0) return 'bg-white text-slate-300 border-slate-100'
  if (count === 1) return 'bg-green-100 text-green-800 border-green-200'
  if (count === 2) return 'bg-yellow-50 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'  // 3 = full
}

// Status badge classes
export function statusClasses(status: BookingStatus): string {
  switch (status) {
    case 'Pending':   return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'Done':      return 'bg-green-50 text-green-800 border-green-200'
    case 'Cancelled': return 'bg-red-50 text-red-800 border-red-200'
  }
}

// Urgency text colour classes
export function urgencyClass(urgency: Urgency): string {
  switch (urgency) {
    case 'Elective':  return 'text-slate-600'
    case 'Urgent':    return 'text-yellow-700 font-semibold'
    case 'Emergency': return 'text-red-600 font-bold'
  }
}
