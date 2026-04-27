import { createClient, type Session } from "@supabase/supabase-js";
import type { OrodhaData, Profile } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function getSupabaseBrowserClient() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutSupabase() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function fetchCurrentProfile(session?: Session | null): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  const userId = session?.user.id;
  if (!supabase || !userId) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchProfiles(): Promise<Profile[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as Profile[];
}

export async function fetchOrodhaData(): Promise<OrodhaData | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const [
    specialties,
    procedures,
    theatres,
    theatreSessions,
    patients,
    surgicalCases,
    preopAssessments,
    bookings,
    caseNotes,
  ] = await Promise.all([
    supabase.from("specialties").select("*").order("name"),
    supabase.from("procedures").select("*").order("name"),
    supabase.from("theatres").select("*").order("name"),
    supabase.from("theatre_sessions").select("*").order("session_date"),
    supabase.from("patients").select("*").order("full_name"),
    supabase.from("surgical_cases").select("*").order("created_at", { ascending: false }),
    supabase.from("preop_assessments").select("*").order("updated_at", { ascending: false }),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("case_notes").select("*").order("created_at", { ascending: false }),
  ]);

  const responses = [
    specialties,
    procedures,
    theatres,
    theatreSessions,
    patients,
    surgicalCases,
    preopAssessments,
    bookings,
    caseNotes,
  ];
  const failed = responses.find((response) => response.error);
  if (failed?.error) throw failed.error;

  return {
    specialties: specialties.data || [],
    procedures: procedures.data || [],
    theatres: theatres.data || [],
    theatre_sessions: theatreSessions.data || [],
    patients: patients.data || [],
    surgical_cases: surgicalCases.data || [],
    preop_assessments: preopAssessments.data || [],
    bookings: bookings.data || [],
    case_notes: caseNotes.data || [],
  } as OrodhaData;
}

export async function upsertRow(table: string, payload: Record<string, unknown>) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).upsert(payload as never).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table: string, id: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
  return true;
}
