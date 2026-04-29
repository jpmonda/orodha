"use client";

import clsx from "clsx";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clipboard,
  Database,
  FileText,
  Lock,
  LogOut,
  Plus,
  Printer,
  Search,
  Shield,
  UserCog,
  UsersRound,
  X,
} from "lucide-react";
import { eachMonthOfInterval, endOfYear, format, getDaysInMonth, parseISO, startOfYear } from "date-fns";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { demoData } from "@/lib/orodha/seed";
import { deleteRow, fetchCurrentProfile, fetchOrodhaData, fetchProfiles, getCurrentSession, isSupabaseConfigured, signInWithPassword, signOutSupabase, upsertRow } from "@/lib/orodha/supabase";
import type {
  Booking,
  BookingStatus,
  EnrichedBooking,
  OrodhaData,
  Patient,
  Profile,
  Sex,
  ShaStatus,
  SurgicalCase,
  TheatreSession,
  UserRole,
} from "@/lib/orodha/types";
import {
  applyCaseStatusFromBooking,
  capacityForSession,
  childAge,
  createId,
  enrichBookings,
  todayIso,
} from "@/lib/orodha/utils";

type MainView = "calendar" | "patients" | "lists" | "daily" | "users" | "audit";
type ViewKey = MainView | "new-patient" | "new-booking";
type BookingStep = "patient" | "details";
type DemoRole = "Admin" | "Surgeon" | "Anaesthetist";
type AppUser = {
  id: string;
  name: string;
  role: UserRole;
  initials: string;
  approved: boolean;
  source: "demo" | "supabase";
  email?: string | null;
};

const storageKey = "orodha-demo-data-v4";
const demoAuthKey = "orodha-demo-auth-v1";
const demoProfilesKey = "orodha-demo-profiles-v1";

function todayInNairobi() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const today = todayInNairobi();
const demoAccounts: { id: string; role: DemoRole; name: string; email: string }[] = [
  { id: "demo-admin", role: "Admin", name: "Dr. K. Mwangi", email: "admin@orodha.demo" },
  { id: "demo-surgeon", role: "Surgeon", name: "Dr. A. Oduya", email: "surgeon@orodha.demo" },
  { id: "demo-anaesthetist", role: "Anaesthetist", name: "Dr. N. Hassan", email: "anaesthetist@orodha.demo" },
];

const navItems: { key: MainView; label: string; icon: ReactNode }[] = [
  { key: "calendar", label: "Calendar", icon: <CalendarDays /> },
  { key: "patients", label: "Patients", icon: <UsersRound /> },
  { key: "lists", label: "Specialty Lists", icon: <Clipboard /> },
  { key: "daily", label: "Theatre List", icon: <Printer /> },
  { key: "users", label: "Admin", icon: <UserCog /> },
  { key: "audit", label: "Audit Log", icon: <FileText /> },
];

const sexOptions: Sex[] = ["Male", "Female", "Other", "Unknown"];
const shaOptions: ShaStatus[] = ["Active", "Inactive", "Unknown"];
function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function buildDemoUser(role: DemoRole): AppUser {
  const account = demoAccounts.find((item) => item.role === role) || demoAccounts[0];
  return {
    id: account.id,
    name: account.name,
    role: account.role,
    initials: initialsFromName(account.name),
    approved: true,
    source: "demo",
    email: account.email,
  };
}

function buildProfileUser(profile: Profile, email?: string | null): AppUser {
  return {
    id: profile.id,
    name: profile.full_name,
    role: profile.role,
    initials: initialsFromName(profile.full_name || email || "OR"),
    approved: profile.approved,
    source: "supabase",
    email: email || null,
  };
}

const demoProfiles: Profile[] = [
  {
    id: "demo-admin",
    full_name: "Dr. K. Mwangi",
    role: "Admin",
    approved: true,
    phone: "0712345678",
    created_at: "2026-04-20T08:00:00.000Z",
    updated_at: "2026-04-26T09:00:00.000Z",
  },
  {
    id: "demo-surgeon",
    full_name: "Dr. A. Oduya",
    role: "Surgeon",
    approved: true,
    phone: "0722551122",
    created_at: "2026-04-21T08:00:00.000Z",
    updated_at: "2026-04-26T09:00:00.000Z",
  },
  {
    id: "demo-anaesthetist",
    full_name: "Dr. N. Hassan",
    role: "Anaesthetist",
    approved: true,
    phone: "0700456789",
    created_at: "2026-04-22T08:00:00.000Z",
    updated_at: "2026-04-26T09:00:00.000Z",
  },
  {
    id: "demo-request-1",
    full_name: "Dr. P. Wekesa",
    role: "Surgeon",
    approved: false,
    phone: "0711002200",
    created_at: "2026-04-27T06:30:00.000Z",
    updated_at: "2026-04-27T06:30:00.000Z",
  },
];

function isConfiguredRole(role: UserRole) {
  return role === "Admin" || role === "Surgeon" || role === "Anaesthetist";
}

export default function OrodhaApp() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function bootstrapAuth() {
      if (!isSupabaseConfigured) {
        const savedRole = window.localStorage.getItem(demoAuthKey) as DemoRole | null;
        if (!cancelled && savedRole) setAppUser(buildDemoUser(savedRole));
        if (!cancelled) setAuthLoading(false);
        return;
      }

      try {
        const session = await getCurrentSession();
        if (!session?.user) {
          if (!cancelled) setAuthLoading(false);
          return;
        }
        const profile = await fetchCurrentProfile(session);
        if (!cancelled && profile) setAppUser(buildProfileUser(profile, session.user.email));
      } catch (error) {
        if (!cancelled) setAuthError(error instanceof Error ? error.message : "Unable to load your account.");
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }
    bootstrapAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSupabaseLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthError("");
    try {
      const result = await signInWithPassword(authEmail, authPassword);
      const profile = await fetchCurrentProfile(result.session);
      if (!profile) throw new Error("Your profile could not be found after sign-in.");
      setAppUser(buildProfileUser(profile, result.user?.email));
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  function handleDemoLogin(role: DemoRole) {
    window.localStorage.setItem(demoAuthKey, role);
    setAppUser(buildDemoUser(role));
  }

  async function handleSignOut() {
    if (appUser?.source === "supabase") {
      await signOutSupabase();
    } else {
      window.localStorage.removeItem(demoAuthKey);
    }
    setAppUser(null);
    setAuthEmail("");
    setAuthPassword("");
  }

  if (authLoading) return <LoadingScreen />;
  if (!appUser) {
    return (
      <LoginScreen
        email={authEmail}
        password={authPassword}
        setEmail={setAuthEmail}
        setPassword={setAuthPassword}
        submit={handleSupabaseLogin}
        submitDisabled={authSubmitting}
        error={authError}
        demoLogin={handleDemoLogin}
      />
    );
  }
  if (!appUser.approved) return <ApprovalScreen appUser={appUser} signOut={handleSignOut} />;
  if (!isConfiguredRole(appUser.role)) return <UnsupportedRoleScreen appUser={appUser} signOut={handleSignOut} />;
  return <OrodhaWorkspace appUser={appUser} onSignOut={handleSignOut} />;
}

function OrodhaWorkspace({ appUser, onSignOut }: { appUser: AppUser; onSignOut: () => Promise<void> }) {
  const [data, setData] = useState<OrodhaData>(demoData);
  const [profiles, setProfiles] = useState<Profile[]>(demoProfiles);
  const [source, setSource] = useState<"demo" | "supabase">(appUser.source);
  const [notice, setNotice] = useState("");
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [view, setView] = useState<ViewKey>("calendar");
  const [previousView, setPreviousView] = useState<ViewKey>("calendar");
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-04-29");
  const [blockingDate, setBlockingDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("patient");
  const [bookingPatientId, setBookingPatientId] = useState<string | null>(null);
  const [bookingSearch, setBookingSearch] = useState("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("sp-urology");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Done" | "Cancelled">("All");
  const isAdmin = appUser.role === "Admin";
  const readOnly = !isAdmin;

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      if (isSupabaseConfigured) {
        try {
          const [remote, remoteProfiles] = await Promise.all([fetchOrodhaData(), fetchProfiles()]);
          if (remote && !cancelled) {
            setData(remote);
            setProfiles(remoteProfiles);
            setSource("supabase");
            return;
          }
        } catch (error) {
          setNotice(`Using demo data until sign-in: ${error instanceof Error ? error.message : "Supabase read failed"}`);
        }
      }
      const saved = window.localStorage.getItem(storageKey);
      if (saved && !cancelled) setData(JSON.parse(saved));
      const savedProfiles = window.localStorage.getItem(demoProfilesKey);
      if (savedProfiles && !cancelled) setProfiles(JSON.parse(savedProfiles));
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (source === "demo") window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, source]);

  useEffect(() => {
    if (source === "demo") window.localStorage.setItem(demoProfilesKey, JSON.stringify(profiles));
  }, [profiles, source]);

  const bookings = useMemo(() => enrichBookings(data), [data]);
  const selectedSession = selectedDate
    ? data.theatre_sessions.find((session) => session.session_date === selectedDate) || virtualSession(selectedDate, data)
    : null;
  const selectedDayBookings = bookings
    .filter((booking) => booking.session.session_date === selectedDate)
    .sort((a, b) => a.slot - b.slot);
  const selectedPatient = selectedPatientId ? data.patients.find((patient) => patient.id === selectedPatientId) || null : null;
  const isWorkspaceEmpty = source === "supabase" && data.patients.length === 0 && data.bookings.length === 0 && data.theatre_sessions.length === 0;
  const selectedDateIsPast = selectedDate ? isPastTheatreDate(selectedDate) : false;

  function describeSupabaseError(error: unknown) {
    return describeError(error);
  }

  function nextSupabaseId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function upsertCollection<K extends keyof OrodhaData>(
    key: K,
    table: string,
    row: OrodhaData[K][number],
    options?: { onConflict?: string },
  ) {
    setData((current) => ({
      ...current,
      [key]: replaceById(current[key] as { id: string }[], row as { id: string }),
    }));
    if (source === "supabase") {
      const saved = await upsertRow(table, row as unknown as Record<string, unknown>, options);
      if (saved && typeof saved === "object" && "id" in saved) {
        setData((current) => ({
          ...current,
          [key]: replaceById(current[key] as { id: string }[], saved as { id: string }),
        }));
      }
    }
  }

  async function saveBooking(booking: Booking) {
    const previousCases = data.surgical_cases;
    const previousBookings = data.bookings;
    try {
      const surgicalCase = data.surgical_cases.find((item) => item.id === booking.case_id);
      if (surgicalCase) {
        await upsertCollection("surgical_cases", "surgical_cases", applyCaseStatusFromBooking(booking, surgicalCase));
      }
      await upsertCollection("bookings", "bookings", booking);
    } catch (error) {
      setData((current) => ({
        ...current,
        surgical_cases: previousCases,
        bookings: previousBookings,
      }));
      throw new Error(describeSupabaseError(error));
    }
  }

  async function saveProfile(profile: Profile) {
    setProfiles((current) => replaceById(current, { ...profile, updated_at: todayIso() }));
    if (source === "supabase") await upsertRow("profiles", { ...profile, updated_at: todayIso() });
    if (appUser.id === profile.id) {
      const nextUser = buildProfileUser({ ...profile, updated_at: todayIso() }, appUser.email);
      setNotice(`Updated ${profile.full_name}'s access.`);
      if (!nextUser.approved || !isConfiguredRole(nextUser.role)) {
        await onSignOut();
        return;
      }
    }
  }

  async function clearClinicalData() {
    const confirmed = window.confirm(
      "Clear all patients, surgical cases, pre-op assessments, bookings, notes, and theatre sessions? Users, roles, specialties, procedures, and theatres will be kept.",
    );
    if (!confirmed) return;

    setNotice("Clearing clinical demo data...");
    try {
      const current = source === "supabase" ? (await fetchOrodhaData()) || data : data;
      const deletePlan: [keyof OrodhaData, string][] = [
        ["case_notes", "case_notes"],
        ["bookings", "bookings"],
        ["preop_assessments", "preop_assessments"],
        ["surgical_cases", "surgical_cases"],
        ["theatre_sessions", "theatre_sessions"],
        ["patients", "patients"],
      ];

      if (source === "supabase") {
        for (const [key, table] of deletePlan) {
          for (const row of current[key] as { id: string }[]) {
            await deleteRow(table, row.id);
          }
        }
      }

      setData((previous) => ({
        ...previous,
        patients: [],
        surgical_cases: [],
        preop_assessments: [],
        bookings: [],
        case_notes: [],
        theatre_sessions: [],
      }));
      setSelectedDate("2026-04-29");
      setSelectedPatientId(null);
      setNotice("Clinical data cleared. Reference data and user access were kept.");
    } catch (error) {
      setNotice(`Could not clear clinical data: ${describeSupabaseError(error)}`);
    }
  }

  async function seedDemoWorkspace() {
    if (source !== "supabase" || seedingDemo) return;
    setSeedingDemo(true);
    setNotice("Loading demo data into your Supabase workspace...");
    try {
      const current = (await fetchOrodhaData()) || data;
      const specialtyIdMap = new Map<string, string>();
      const theatreIdMap = new Map<string, string>();
      const procedureIdMap = new Map<string, string>();
      const patientIdMap = new Map<string, string>();
      const sessionIdMap = new Map<string, string>();
      const caseIdMap = new Map<string, string>();

      const specialtiesByName = new Map(current.specialties.map((item) => [item.name.toLowerCase(), item]));
      for (const row of demoData.specialties) {
        const existing = specialtiesByName.get(row.name.toLowerCase());
        if (existing) {
          specialtyIdMap.set(row.id, existing.id);
          await upsertRow("specialties", { ...row, id: existing.id });
        } else {
          const payload = { ...row, id: nextSupabaseId() };
          const saved = await upsertRow("specialties", payload as unknown as Record<string, unknown>);
          const savedId = ((saved as { id?: string } | null)?.id || payload.id) as string;
          specialtyIdMap.set(row.id, savedId);
          specialtiesByName.set(row.name.toLowerCase(), { ...row, id: savedId });
        }
      }

      const theatresByName = new Map(current.theatres.map((item) => [item.name.toLowerCase(), item]));
      for (const row of demoData.theatres) {
        const existing = theatresByName.get(row.name.toLowerCase());
        if (existing) {
          theatreIdMap.set(row.id, existing.id);
          await upsertRow("theatres", { ...row, id: existing.id });
        } else {
          const payload = { ...row, id: nextSupabaseId() };
          const saved = await upsertRow("theatres", payload as unknown as Record<string, unknown>);
          const savedId = ((saved as { id?: string } | null)?.id || payload.id) as string;
          theatreIdMap.set(row.id, savedId);
          theatresByName.set(row.name.toLowerCase(), { ...row, id: savedId });
        }
      }

      const proceduresByKey = new Map(current.procedures.map((item) => [`${item.specialty_id || "none"}::${item.name.toLowerCase()}`, item]));
      for (const row of demoData.procedures) {
        const specialty_id = row.specialty_id ? specialtyIdMap.get(row.specialty_id) || row.specialty_id : null;
        const key = `${specialty_id || "none"}::${row.name.toLowerCase()}`;
        const existing = proceduresByKey.get(key);
        if (existing) {
          procedureIdMap.set(row.id, existing.id);
          await upsertRow("procedures", { ...row, id: existing.id, specialty_id });
        } else {
          const payload = { ...row, id: nextSupabaseId(), specialty_id };
          const saved = await upsertRow("procedures", payload);
          const savedId = ((saved as { id?: string } | null)?.id || payload.id) as string;
          procedureIdMap.set(row.id, savedId);
          proceduresByKey.set(key, { ...row, id: savedId, specialty_id });
        }
      }

      const patientsByNumber = new Map(current.patients.map((item) => [item.hospital_number, item]));
      for (const row of demoData.patients) {
        const existing = patientsByNumber.get(row.hospital_number);
        const payload = { ...row, id: existing?.id || nextSupabaseId() };
        const saved = await upsertRow("patients", payload);
        const savedId = ((saved as { id?: string } | null)?.id || payload.id) as string;
        patientIdMap.set(row.id, savedId);
        patientsByNumber.set(row.hospital_number, { ...row, id: savedId });
      }

      const sessionsByKey = new Map(
        current.theatre_sessions.map((item) => [`${item.theatre_id}::${item.session_date}::${item.session_name.toLowerCase()}`, item]),
      );
      for (const row of demoData.theatre_sessions) {
        const theatre_id = theatreIdMap.get(row.theatre_id) || row.theatre_id;
        const key = `${theatre_id}::${row.session_date}::${row.session_name.toLowerCase()}`;
        const existing = sessionsByKey.get(key);
        const payload = { ...row, id: existing?.id || nextSupabaseId(), theatre_id };
        const saved = await upsertRow("theatre_sessions", payload);
        const savedId = ((saved as { id?: string } | null)?.id || payload.id) as string;
        sessionIdMap.set(row.id, savedId);
        sessionsByKey.set(key, { ...row, id: savedId, theatre_id });
      }

      const existingCases = current.surgical_cases;
      for (const row of demoData.surgical_cases) {
        const payload = {
          ...row,
          id: nextSupabaseId(),
          patient_id: patientIdMap.get(row.patient_id) || row.patient_id,
          specialty_id: row.specialty_id ? specialtyIdMap.get(row.specialty_id) || row.specialty_id : null,
          procedure_id: row.procedure_id ? procedureIdMap.get(row.procedure_id) || row.procedure_id : null,
        };
        const existing = existingCases.find(
          (item) =>
            item.patient_id === payload.patient_id &&
            item.procedure_name.toLowerCase() === payload.procedure_name.toLowerCase() &&
            item.created_at === row.created_at,
        );
        if (existing) payload.id = existing.id;
        const saved = await upsertRow("surgical_cases", payload);
        caseIdMap.set(row.id, ((saved as { id?: string } | null)?.id || payload.id) as string);
      }

      const afterCases = (await fetchOrodhaData()) || current;
      const preopByCaseId = new Map(afterCases.preop_assessments.map((item) => [item.case_id, item]));
      for (const row of demoData.preop_assessments) {
        const case_id = caseIdMap.get(row.case_id) || row.case_id;
        const existing = preopByCaseId.get(case_id);
        const payload = { ...row, id: existing?.id || nextSupabaseId(), case_id };
        const saved = await upsertRow("preop_assessments", payload);
        preopByCaseId.set(case_id, { ...row, id: ((saved as { id?: string } | null)?.id || payload.id) as string, case_id });
      }

      const bookingsBySlot = new Map(afterCases.bookings.map((item) => [`${item.session_id}::${item.slot}`, item]));
      for (const row of demoData.bookings) {
        const case_id = caseIdMap.get(row.case_id) || row.case_id;
        const session_id = sessionIdMap.get(row.session_id) || row.session_id;
        const existing = bookingsBySlot.get(`${session_id}::${row.slot}`);
        const payload = { ...row, id: existing?.id || nextSupabaseId(), case_id, session_id };
        const saved = await upsertRow("bookings", payload);
        bookingsBySlot.set(`${session_id}::${row.slot}`, { ...row, id: ((saved as { id?: string } | null)?.id || payload.id) as string, case_id, session_id });
      }

      for (const row of demoData.case_notes) {
        const payload = { ...row, id: nextSupabaseId(), case_id: caseIdMap.get(row.case_id) || row.case_id };
        await upsertRow("case_notes", payload);
      }

      const refreshed = await fetchOrodhaData();
      if (refreshed) setData(refreshed);
      setNotice("Demo data loaded into your Supabase workspace.");
    } catch (error) {
      setNotice(`Could not load demo data: ${describeSupabaseError(error)}`);
    } finally {
      setSeedingDemo(false);
    }
  }

  async function blockTheatreDate(date: string, reason: string) {
    const existing = data.theatre_sessions.find((session) => session.session_date === date);
    const session: TheatreSession = existing
      ? { ...existing, is_blocked: true, block_reason: reason, notes: existing.notes || reason }
      : { ...virtualSession(date, data), id: createId("session"), is_blocked: true, block_reason: reason, notes: reason };
    await upsertCollection("theatre_sessions", "theatre_sessions", session);
    setBlockingDate(null);
    setBlockReason("");
    setSelectedDate(date);
  }

  function go(viewKey: ViewKey) {
    if (["calendar", "patients", "lists", "daily", "audit"].includes(viewKey)) setPreviousView(viewKey);
    setView(viewKey);
  }

  function startNewBooking(patientId?: string) {
    setPreviousView(view === "new-patient" || view === "new-booking" ? previousView : view);
    setBookingStep(patientId ? "details" : "patient");
    setBookingPatientId(patientId || null);
    setBookingSearch(patientId ? data.patients.find((patient) => patient.id === patientId)?.full_name || "" : "");
    setView("new-booking");
  }

  const activeView = ["calendar", "patients", "lists", "daily", "users", "audit"].includes(view)
    ? (view as MainView)
    : ["calendar", "patients", "lists", "daily", "users", "audit"].includes(previousView)
      ? (previousView as MainView)
      : "calendar";
  const contentView = view === "new-booking" ? activeView : view;

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Sidebar activeView={activeView} setView={go} appUser={appUser} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar appUser={appUser} signOut={onSignOut} />
        <main className="min-h-0 flex-1 overflow-auto">
          {notice && <div className="mx-10 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">{notice}</div>}
          {isWorkspaceEmpty && isAdmin && (
            <div className="mx-10 mt-4 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <div>
                <div className="font-semibold">Your Supabase workspace is empty.</div>
                <div className="mt-1 text-emerald-800">Load the Orodha starter demo data to populate patients, theatre sessions, bookings, blocked Kenyan holidays, and list history.</div>
              </div>
              <button className="btn-primary shrink-0 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60" onClick={seedDemoWorkspace} disabled={seedingDemo}>
                {seedingDemo ? "Loading demo..." : "Load demo data"}
              </button>
            </div>
          )}
          {contentView === "calendar" && (
            <CalendarScreen
              data={data}
              selectedDate={selectedDate}
              selectedSession={selectedSession}
              dayBookings={selectedDayBookings}
              setSelectedDate={setSelectedDate}
              closeDayPanel={() => setSelectedDate("")}
              openBlockDay={(date, reason) => {
                if (readOnly) {
                  setNotice(`${appUser.role} access is read-only. Only admins can block theatre days.`);
                  return;
                }
                setBlockingDate(date);
                setBlockReason(reason || "");
              }}
              startNewBooking={() => {
                if (readOnly) {
                  setNotice(`${appUser.role} access is read-only. Only admins can create bookings.`);
                  return;
                }
                if (selectedDateIsPast) {
                  setNotice("The selected theatre day is in the past. Choose today or a future date in the booking form.");
                }
                startNewBooking();
              }}
              saveBooking={saveBooking}
              readOnly={readOnly}
            />
          )}
          {contentView === "patients" && (
            <PatientsScreen
              data={data}
              bookings={bookings}
              query={query}
              setQuery={setQuery}
              selectedPatient={selectedPatient}
              setSelectedPatientId={setSelectedPatientId}
              newPatient={() => {
                if (readOnly) {
                  setNotice(`${appUser.role} access is read-only. Only admins can create patient records.`);
                  return;
                }
                setPreviousView("patients");
                setView("new-patient");
              }}
              bookPatient={(patientId) => {
                if (readOnly) {
                  setNotice(`${appUser.role} access is read-only. Only admins can create bookings.`);
                  return;
                }
                startNewBooking(patientId);
              }}
              readOnly={readOnly}
            />
          )}
          {contentView === "lists" && (
            <SpecialtyListsScreen
              data={data}
              bookings={bookings}
              selectedSpecialtyId={selectedSpecialtyId}
              setSelectedSpecialtyId={setSelectedSpecialtyId}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}
          {contentView === "daily" && <TheatreListScreen data={data} bookings={bookings} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
          {contentView === "users" && isAdmin && (
            <UserManagementScreen
              profiles={profiles}
              appUser={appUser}
              source={source}
              data={data}
              saveProfile={saveProfile}
              clearClinicalData={clearClinicalData}
              seedDemoWorkspace={seedDemoWorkspace}
              seedingDemo={seedingDemo}
            />
          )}
          {contentView === "audit" && isAdmin && <AuditLogScreen bookings={bookings} appUser={appUser} />}
          {view === "new-patient" && (
            <NewPatientScreen
              back={() => setView(previousView)}
              save={async (patient) => {
                await upsertCollection("patients", "patients", patient);
                setSelectedPatientId(patient.id);
                setView("patients");
              }}
            />
          )}
          {view === "new-booking" && (
            <NewBookingScreen
              data={data}
              step={bookingStep}
              setStep={setBookingStep}
              patientId={bookingPatientId}
              setPatientId={setBookingPatientId}
              search={bookingSearch}
              setSearch={setBookingSearch}
              defaultDate={activeView === "calendar" ? selectedDate || today : today}
              back={() => setView(previousView)}
              newPatient={() => {
                setPreviousView("new-booking");
                setView("new-patient");
              }}
              saveCase={(surgicalCase) => upsertCollection("surgical_cases", "surgical_cases", surgicalCase)}
              savePreop={(preop) => upsertCollection("preop_assessments", "preop_assessments", preop, { onConflict: "case_id" })}
              saveSession={(session) => upsertCollection("theatre_sessions", "theatre_sessions", session)}
              saveBooking={saveBooking}
              done={(date) => {
                setSelectedDate(date);
                setView("calendar");
              }}
            />
          )}
        </main>
        {blockingDate && (
          <BlockDayModal
            date={blockingDate}
            reason={blockReason}
            setReason={setBlockReason}
            cancel={() => {
              setBlockingDate(null);
              setBlockReason("");
            }}
            confirm={() => blockTheatreDate(blockingDate, blockReason.trim())}
          />
        )}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--bg)] px-6">
      <div className="rounded-[1.75rem] border border-[var(--border)] bg-white px-6 py-5 shadow-[var(--shadow-card)]">
        <BrandLockup
          subtitle="Paediatric Theatre Management"
          size={56}
          gapClassName="gap-4"
          roundedClassName="rounded-[1rem]"
          titleClassName="text-[1.6rem] font-semibold leading-none tracking-[-0.01em] text-[#111a16]"
          subtitleClassName="mt-1.5 text-[0.92rem] leading-none text-[var(--muted)]"
        />
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="text-base font-semibold text-[#111a16]">Preparing your theatre workspace...</div>
          <div className="mt-1 text-sm text-[var(--muted)]">Loading Orodha</div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({
  email,
  password,
  setEmail,
  setPassword,
  submit,
  submitDisabled,
  error,
  demoLogin,
}: {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  submitDisabled: boolean;
  error: string;
  demoLogin: (role: DemoRole) => void;
}) {
  const loginHighlights = [
    {
      title: "Calendar oversight",
      detail: "View and manage all theatre sessions across sites in one place.",
      icon: <CalendarDays size={22} />,
    },
    {
      title: "Patient tracking",
      detail: "Follow each patient from booking through recovery in real time.",
      icon: <UsersRound size={22} />,
    },
    {
      title: "Theatre list visibility",
      detail: "Shared operative lists, always in sync between surgery and anaesthesia.",
      icon: <Printer size={22} />,
    },
  ];

  return (
    <div className="min-h-dvh bg-[var(--bg)] xl:grid xl:min-h-dvh xl:grid-cols-[0.58fr_1.42fr]">
      <section className="hidden bg-[var(--green-deep)] px-8 py-10 text-white xl:flex xl:flex-col">
        <BrandLockup
          subtitle="Paediatric Theatre Management"
          size={82}
          gapClassName="gap-5.5"
          roundedClassName="rounded-[1.15rem]"
          titleClassName="text-[1.9rem] font-semibold leading-none tracking-[-0.015em]"
          subtitleClassName="mt-1.5 text-[0.96rem] leading-none text-[#b8d3c4]"
        />
        <div className="mt-16 max-w-[390px]">
          <h1 className="text-[3.1rem] font-medium leading-[1.08] tracking-[-0.03em]">
            <span className="block">Patients.</span>
            <span className="mt-2 block">Lists.</span>
            <span className="mt-2 block">Teams.</span>
          </h1>
          <p className="mt-7 max-w-[360px] text-[0.98rem] leading-7 text-[#c3d8cb]">
            One place for Paediatric theatre bookings.
          </p>
        </div>
        <div className="mt-auto grid gap-4">
          {loginHighlights.map((item) => (
            <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-4 text-[#dceee4] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-start gap-3.5">
                <div className="grid size-12 shrink-0 place-items-center rounded-[0.9rem] bg-white/10 text-[#dfeee4]">
                  {item.icon}
                </div>
                <div>
                  <div className="text-[0.96rem] font-semibold leading-none text-white">{item.title}</div>
                  <div className="mt-1.5 text-[0.9rem] leading-7 text-[#b9d1c4]">{item.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-6 sm:px-8 sm:py-10 xl:bg-white xl:px-12">
        <div className="w-full max-w-[600px]">
          <div className="xl:hidden">
            <BrandLockup
              subtitle="Paediatric Theatre Management"
              size={68}
              gapClassName="gap-4"
              roundedClassName="rounded-[1rem]"
              titleClassName="text-[1.62rem] font-semibold leading-none tracking-[-0.01em]"
              subtitleClassName="mt-1.5 text-[0.92rem] leading-none text-[var(--muted)]"
            />
          </div>
          <div className="mt-8 rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7 xl:mt-0 xl:max-w-[500px] xl:px-8 xl:py-8">
            <div className="text-[3rem] font-semibold leading-none tracking-[-0.03em] text-[#111a16]">Sign in</div>
            <p className="mt-3 text-[0.96rem] leading-7 text-[var(--muted)]">Welcome back. Sign in to continue.</p>
          
            {isSupabaseConfigured ? (
            <form onSubmit={submit} className="mt-7 space-y-4">
              <Field label="Email address">
                <input className="input h-[3rem] rounded-[0.85rem] px-3.5 text-[0.96rem]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@hospital.org" required />
              </Field>
              <Field label="Password">
                <input className="input h-[3rem] rounded-[0.85rem] px-3.5 text-[0.96rem]" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" required />
              </Field>
              <div className="-mt-1 text-right text-[0.92rem] font-medium text-[var(--green-mid)]">Forgot password?</div>
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
              <button className="btn-secondary w-full justify-center rounded-[0.85rem] border-[var(--border)] py-2.5 text-[0.98rem] font-medium text-[#111a16] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitDisabled}>
                {submitDisabled ? "Signing in..." : "Sign in"}
              </button>
              <div className="rounded-[1rem] border border-[#e5e0d2] bg-[#f5f2e9] px-4 py-4 text-[0.96rem] leading-7 text-[#4f534e]">
                Access is restricted to verified clinical staff. Contact your theatre coordinator if you need an account.
              </div>
              <div className="flex items-center gap-3 text-[0.92rem] text-[var(--muted)]">
                <Shield size={16} />
                <span>End-to-end encrypted</span>
              </div>
            </form>
          ) : (
            <div className="mt-8">
              <div className="rounded-[1rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                Supabase isn&apos;t configured yet, so this login page is running in demo mode for now.
              </div>
              <div className="mt-6 grid gap-4">
                {demoAccounts.map((account) => (
                  <button key={account.role} className="rounded-[1rem] border border-[var(--border)] bg-white px-5 py-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/60" onClick={() => demoLogin(account.role)}>
                    <div className="text-base font-semibold">{account.role}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">{account.name}</div>
                    <div className="mt-2 text-sm leading-7 text-[var(--muted)]">
                      {account.role === "Admin" ? "Full access to theatre scheduling and updates." : "Read-only access to the calendar, patients, and operative lists."}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 text-[0.95rem] text-[var(--muted)]">
                <Shield size={18} />
                <span>Configured demo roles for local workflow testing</span>
              </div>
            </div>
          )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ApprovalScreen({ appUser, signOut }: { appUser: AppUser; signOut: () => Promise<void> }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-[520px] rounded-[1.75rem] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-card)]">
        <BrandLockup
          subtitle="Paediatric Theatre Management"
          size={60}
          gapClassName="gap-4"
          roundedClassName="rounded-[1rem]"
          titleClassName="text-[1.7rem] font-semibold leading-none tracking-[-0.01em] text-[#111a16]"
          subtitleClassName="mt-1.5 text-[0.93rem] leading-none text-[var(--muted)]"
        />
        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <div className="text-[1.55rem] font-semibold">Approval pending</div>
          <div className="mt-1 text-sm text-[var(--muted)]">{appUser.email || appUser.name}</div>
        </div>
        <p className="mt-5 text-[var(--muted)]">Your account exists, but it still needs to be approved before Orodha can open your clinical workspace.</p>
        <button className="btn-secondary mt-8" onClick={signOut}>Sign out</button>
      </div>
    </div>
  );
}

function UnsupportedRoleScreen({ appUser, signOut }: { appUser: AppUser; signOut: () => Promise<void> }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-[560px] rounded-[1.75rem] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-card)]">
        <div className="text-[1.7rem] font-semibold">Role not configured for this app</div>
        <p className="mt-4 text-[var(--muted)]">
          {appUser.role} accounts are present in the schema, but this version of the interface currently supports Admin, Surgeon, and Anaesthetist access only.
        </p>
        <button className="btn-secondary mt-8" onClick={signOut}>Sign out</button>
      </div>
    </div>
  );
}

function BrandLockup({
  subtitle,
  size,
  titleClassName,
  subtitleClassName,
  gapClassName,
  roundedClassName,
}: {
  subtitle: string;
  size: number;
  titleClassName: string;
  subtitleClassName: string;
  gapClassName: string;
  roundedClassName: string;
}) {
  return (
    <div className={clsx("flex items-center", gapClassName)}>
      <Image src="/orodha-brand-ui.png" alt="Orodha logo" width={size} height={size} className={clsx("shrink-0 object-contain", roundedClassName)} />
      <div className="flex flex-col justify-center">
        <div className={titleClassName}>Orodha</div>
        <div className={subtitleClassName}>{subtitle}</div>
      </div>
    </div>
  );
}

function Sidebar({ activeView, setView, appUser }: { activeView: MainView; setView: (view: MainView) => void; appUser: AppUser }) {
  const visibleItems = appUser.role === "Admin" ? navItems : navItems.filter((item) => item.key !== "audit" && item.key !== "users");
  return (
    <aside className="hidden w-[248px] shrink-0 bg-[var(--green-deep)] text-white xl:flex xl:flex-col">
      <div className="flex h-[110px] items-center border-b border-white/10 px-6">
        <BrandLockup
          subtitle="Theatre Management"
          size={56}
          gapClassName="gap-4"
          roundedClassName="rounded-[1.05rem]"
          titleClassName="text-[1.5rem] font-bold leading-none tracking-[-0.01em]"
          subtitleClassName="mt-1.5 text-[0.94rem] font-medium leading-none text-[#9cc9aa]"
        />
      </div>
      <nav className="flex-1 space-y-2 px-3 py-4">
        {visibleItems.map((item) => (
          <button key={item.key} className={clsx("nav-item", activeView === item.key && "nav-item-active")} onClick={() => setView(item.key)}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="flex h-[84px] items-center gap-3 border-t border-white/10 px-5">
        <Avatar appUser={appUser} />
        <div>
          <div className="text-sm font-semibold">{appUser.name}</div>
          <div className="text-sm text-[#9cc9aa]">{appUser.role}</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ appUser, signOut }: { appUser: AppUser; signOut: () => Promise<void> }) {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[var(--border)] bg-white px-5 xl:px-9">
      <div className="text-base font-medium text-[var(--muted)]">Sunday, 26 April 2026</div>
      <div className="flex items-center gap-5">
        <div className="relative hidden w-[264px] md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
          <input className="input h-10 text-sm leading-none" style={{ paddingLeft: "2.35rem", paddingRight: "0.8rem" }} placeholder="Search patients, UMR..." />
        </div>
        <div className="flex items-center gap-2.5">
          <Avatar appUser={appUser} />
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold">{appUser.name}</div>
            <div className="text-sm text-[var(--muted)]">{appUser.role}</div>
          </div>
          <button className="icon-button" aria-label="Sign out" onClick={signOut} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

function CalendarScreen({
  data,
  selectedDate,
  selectedSession,
  dayBookings,
  setSelectedDate,
  closeDayPanel,
  openBlockDay,
  startNewBooking,
  saveBooking,
  readOnly,
}: {
  data: OrodhaData;
  selectedDate: string;
  selectedSession: TheatreSession | null;
  dayBookings: EnrichedBooking[];
  setSelectedDate: (date: string) => void;
  closeDayPanel: () => void;
  openBlockDay: (date: string, reason?: string | null) => void;
  startNewBooking: () => void;
  saveBooking: (booking: Booking) => Promise<void>;
  readOnly: boolean;
  }) {
    const months = eachMonthOfInterval({ start: startOfYear(parseISO(today)), end: endOfYear(parseISO(today)) });
    const sessions = new Map(data.theatre_sessions.map((session) => [session.session_date, session]));
  
    return (
      <div className="min-h-full">
        <div className="border-b border-[var(--border)] px-7 py-7">
          <PageHeader
            title="Theatre Calendar"
            subtitle="2026 - Paediatric Surgery Unit"
            action={
              <div className="flex items-center gap-5">
                <CalendarLegend />
                <button
                  className="btn-primary px-5 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={startNewBooking}
                  disabled={readOnly}
                  title={readOnly ? "Only admins can create or edit bookings." : "Create a new booking"}
                >
                  <Plus size={18} /> New Booking
                </button>
              </div>
            }
          />
        </div>
        <div className="flex min-h-0">
          <section className="min-w-0 flex-1">
            <div className="overflow-x-auto px-7 py-6">
              <div className="min-w-[1000px] space-y-2">
                <div className="grid grid-cols-[98px_repeat(31,minmax(0,1fr))] gap-1 pr-1 text-center text-[0.82rem] font-medium text-[var(--muted)]">
                  <div />
                  {Array.from({ length: 31 }, (_, index) => <div key={index}>{index + 1}</div>)}
                </div>
                {months.map((month) => {
                  const days = getDaysInMonth(month);
                  return (
                    <div key={month.toISOString()} className="grid grid-cols-[98px_repeat(31,minmax(0,1fr))] items-center gap-1">
                      <div className="text-[1.02rem] font-semibold">{format(month, "MMMM")}</div>
                      {Array.from({ length: 31 }, (_, index) => {
                        const day = index + 1;
                        if (day > days) return <div key={day} className="aspect-square w-full" />;
                        const dateObject = new Date(2026, month.getMonth(), day);
                        const date = format(dateObject, "yyyy-MM-dd");
                        const isWeekend = dateObject.getDay() === 0 || dateObject.getDay() === 6;
                        const session = sessions.get(date);
                        const capacity = session ? capacityForSession(data, session) : null;
                        return (
                          <button
                            key={date}
                            className={clsx("calendar-cell", calendarCellTone(session, capacity, isWeekend), date === selectedDate && "ring-[3px] ring-[var(--green-accent)] ring-offset-1")}
                            onClick={() => setSelectedDate(date)}
                            title={capacity?.isFull ? "Day fully booked" : session?.is_blocked ? session.block_reason || "Theatre day blocked" : undefined}
                          >
                            {session?.is_blocked ? <Lock size={13} /> : capacity?.booked || day}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          {selectedSession && (
            <DayPanel
              data={data}
              selectedDate={selectedDate}
              session={selectedSession}
              bookings={dayBookings}
              close={closeDayPanel}
              openBlockDay={openBlockDay}
              startNewBooking={startNewBooking}
              saveBooking={saveBooking}
              readOnly={readOnly}
            />
          )}
        </div>
      </div>
    );
  }

function DayPanel({
  data,
  selectedDate,
  session,
  bookings,
  close,
  openBlockDay,
  startNewBooking,
  saveBooking,
  readOnly,
}: {
  data: OrodhaData;
  selectedDate: string;
  session: TheatreSession;
  bookings: EnrichedBooking[];
  close: () => void;
  openBlockDay: (date: string, reason?: string | null) => void;
  startNewBooking: () => void;
  saveBooking: (booking: Booking) => Promise<void>;
  readOnly: boolean;
}) {
  const sessionCapacity = capacityForSession(data, session);
  const isFull = sessionCapacity.isFull;
  const isPast = isPastTheatreDate(selectedDate);
  const activeOccupiedSlots = new Set(bookings.filter(isCapacityBooking).map((booking) => booking.slot));
  const bookSlotDisabled = isFull || isPast || readOnly || session.is_blocked;
  const bookSlotTitle = readOnly
    ? "Only admins can create bookings."
    : isPast
      ? "Only today or future dates can have bookings."
      : session.is_blocked
        ? "This theatre day is blocked."
        : isFull
          ? "All slots are filled for this day."
          : "Book into an available slot";
  return (
    <aside className="hidden w-[352px] shrink-0 border-l border-[var(--border)] bg-white xl:flex xl:flex-col">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-[var(--border)] px-5 py-5">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--muted)]">{format(parseISO(selectedDate), "EEEE")}</div>
          <div className="mt-1.5 text-[1.48rem] font-bold leading-tight tracking-[-0.02em]">{format(parseISO(selectedDate), "d MMMM yyyy")}</div>
        </div>
        <div className="flex items-start gap-2 pt-0.5">
          <button
            className="btn-secondary min-h-[38px] rounded-xl px-3 py-1.5 text-[0.92rem] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => openBlockDay(selectedDate, session.block_reason)}
            disabled={readOnly}
            title={readOnly ? "Only admins can block theatre days." : "Block this theatre day"}
          >
            <Lock size={13} className="text-amber-600" /> Block day
          </button>
          <button
            className="grid h-[38px] w-[38px] place-items-center rounded-xl border border-[var(--border)] bg-white text-[var(--muted)] transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Close day panel"
            onClick={close}
          >
            <X size={17} />
          </button>
        </div>
      </div>
      <div className="scrollbar-soft flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-base font-bold uppercase tracking-[0.04em] text-[var(--muted)]">{sessionCapacity.booked}/{session.max_cases} slots booked</div>
          <button
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-semibold text-[var(--green-mid)] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            onClick={startNewBooking}
            disabled={bookSlotDisabled}
            title={bookSlotTitle}
          >
            <Plus size={14} className="inline-block" /> Book slot
          </button>
        </div>
        {isPast && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            Only today or future dates can have new bookings. This day remains visible for theatre history.
          </div>
        )}
        {bookings.map((booking) => (
          <TheatreSlot key={booking.id} booking={booking} saveBooking={saveBooking} readOnly={readOnly || isPast} />
        ))}
        {!session.is_blocked &&
          Array.from({ length: session.max_cases }, (_, index) => {
            const slot = index + 1;
            return activeOccupiedSlots.has(slot) ? null : <EmptySlot key={`available-${slot}`} slot={slot} />;
          })}
      </div>
      <div className="border-t border-[var(--border)] p-5">
        <button className="btn-secondary w-full justify-center py-2.5 text-base" onClick={() => window.print()}>Print Theatre List</button>
      </div>
    </aside>
  );
}

function TheatreSlot({ booking, saveBooking, readOnly }: { booking: EnrichedBooking; saveBooking: (booking: Booking) => Promise<void>; readOnly: boolean }) {
  const done = booking.booking_status === "Done";
  const postponed = booking.booking_status === "Postponed";
  const cancelled = booking.booking_status === "Cancelled";
  const editableBookedCase = booking.booking_status === "Booked";
  return (
    <article className={clsx("rounded-xl border p-4", done ? "border-emerald-200 bg-emerald-50" : postponed ? "border-slate-200 bg-slate-50" : cancelled ? "border-red-200 bg-red-50" : "border-amber-300 bg-amber-50")}>
      <div className="flex justify-between">
        <div className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--muted)]">Slot {booking.slot}</div>
        <StatusBadge status={booking.booking_status} uiPending />
      </div>
      <div className="mt-3 text-base font-semibold leading-snug">{booking.patient.full_name}</div>
      <div className="text-sm text-[var(--muted)]">{booking.patient.hospital_number} · {childAge(booking.patient.date_of_birth, booking.patient.age_text)} · {booking.patient.sex}</div>
      <div className="mt-2 text-[0.95rem] font-medium leading-snug">{booking.surgicalCase.procedure_name}</div>
      <div className="text-sm text-[var(--muted)]">{booking.specialty?.name} · <span className={booking.surgicalCase.priority === "Urgent" || booking.surgicalCase.priority === "Emergency" ? "font-semibold text-orange-700" : "font-semibold"}>{booking.surgicalCase.priority}</span></div>
      {booking.preop?.preop_notes && <div className="mt-3 rounded-md bg-black/5 px-3 py-2 text-xs text-[var(--muted)]">{booking.preop.preop_notes}</div>}
      {!readOnly && editableBookedCase && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className="rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-sm font-semibold text-emerald-800"
            onClick={() => {
              void saveBooking({ ...booking, booking_status: "Done", updated_at: todayIso() }).catch((error) => {
                window.alert(error instanceof Error ? error.message : "Could not mark booking done.");
              });
            }}
          >
            ✓ Mark Done
          </button>
          <button
            className="rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-800"
            onClick={() => {
              void saveBooking({ ...booking, booking_status: "Cancelled", cancellation_reason: "Cancelled from day panel", updated_at: todayIso() }).catch((error) => {
                window.alert(error instanceof Error ? error.message : "Could not cancel booking.");
              });
            }}
          >
            × Cancel
          </button>
        </div>
      )}
    </article>
  );
}

function PatientsScreen({
  data,
  bookings,
  query,
  setQuery,
  selectedPatient,
  setSelectedPatientId,
  newPatient,
  bookPatient,
  readOnly,
}: {
  data: OrodhaData;
  bookings: EnrichedBooking[];
  query: string;
  setQuery: (value: string) => void;
  selectedPatient: Patient | null;
  setSelectedPatientId: (id: string | null) => void;
  newPatient: () => void;
  bookPatient: (patientId: string) => void;
  readOnly: boolean;
}) {
  const patients = data.patients.filter((patient) =>
    [patient.full_name, patient.hospital_number, patient.residence || ""].some((value) => value.toLowerCase().includes(query.toLowerCase())),
  );
  return (
    <div className="flex min-h-full">
      <section className="min-w-0 flex-1 px-8 py-8">
        <PageHeader
          title="Patients"
          subtitle={`${data.patients.length} records`}
          action={
            <button className="btn-primary px-5 disabled:cursor-not-allowed disabled:opacity-60" onClick={newPatient} disabled={readOnly} title={readOnly ? "Only admins can create patient records." : "Create a new patient record"}>
              <Plus size={18} /> New patient
            </button>
          }
        />
        <SearchInput className="mt-5" value={query} onChange={setQuery} placeholder="Search by name or UMR..." />
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
          <table className="data-table">
            <thead>
              <tr>
                <th>UMR</th>
                <th>Patient name</th>
                <th>Age / Sex</th>
                <th>Residence</th>
                <th>SHA</th>
                <th>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => {
                const patientBookings = bookings.filter((booking) => booking.patient.id === patient.id);
                const selected = selectedPatient?.id === patient.id;
                return (
                  <tr key={patient.id} className={clsx("cursor-pointer transition-colors hover:bg-emerald-50/60", selected && "bg-emerald-50 hover:bg-emerald-50")} onClick={() => setSelectedPatientId(patient.id)}>
                    <td className="font-mono text-sm font-bold text-[var(--muted)]">{patient.hospital_number}</td>
                    <td className="text-[1.02rem] font-semibold">{patient.full_name}</td>
                    <td className="text-[var(--muted)]">{childAge(patient.date_of_birth, patient.age_text)} · {patient.sex[0]}</td>
                    <td className="text-[var(--muted)]">{patient.residence || "-"}</td>
                    <td><ShaBadge status={patient.sha_status} /></td>
                    <td><span className="text-base font-bold">{patientBookings.length}</span> <span className="text-[var(--muted)]">({patientBookings.filter((booking) => booking.booking_status === "Booked").length} upcoming)</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {selectedPatient && <PatientPanel patient={selectedPatient} bookings={bookings.filter((booking) => booking.patient.id === selectedPatient.id)} close={() => setSelectedPatientId(null)} book={() => bookPatient(selectedPatient.id)} readOnly={readOnly} />}
    </div>
  );
}

function PatientPanel({ patient, bookings, close, book, readOnly }: { patient: Patient; bookings: EnrichedBooking[]; close: () => void; book: () => void; readOnly: boolean }) {
  return (
    <aside className="hidden w-[494px] shrink-0 border-l border-[var(--border)] bg-white xl:block">
      <div className="flex items-start justify-between border-b border-[var(--border)] px-8 py-7">
        <div>
          <div className="text-2xl font-bold">{patient.full_name}</div>
          <div className="mt-1 font-mono text-sm text-[var(--muted)]">{patient.hospital_number}</div>
        </div>
        <button className="text-[var(--muted)]" onClick={close}><X /></button>
      </div>
      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-2 gap-5 border-b border-[var(--border)] pb-6">
          <Info label="DOB" value={patient.date_of_birth ? format(parseISO(patient.date_of_birth), "dd/MM/yyyy") : "-"} />
          <Info label="Age" value={childAge(patient.date_of_birth, patient.age_text)} />
          <Info label="Sex" value={patient.sex} />
          <Info label="Residence" value={patient.residence || "-"} />
          <Info label="Phone" value={patient.phone_primary || "-"} />
          <Info label="SHA" value={patient.sha_status} />
        </div>
        <div>
          <div className="mb-4 text-base font-bold uppercase tracking-[0.06em] text-[var(--muted)]">Bookings ({bookings.length})</div>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-[var(--border)] p-4">
                <div className="flex justify-between gap-3 text-sm text-[var(--muted)]">
                  <span>{format(parseISO(booking.session.session_date), "d MMM yyyy")} · Slot {booking.slot}</span>
                  <StatusBadge status={booking.booking_status} uiPending />
                </div>
                <div className="mt-1 font-bold">{booking.surgicalCase.procedure_name}</div>
                <div className="text-[var(--muted)]">{booking.specialty?.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary justify-center" disabled title="Editing is limited to admin users">Edit record</button>
          <button className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60" onClick={book} disabled={readOnly} title={readOnly ? "Only admins can create bookings." : "Create a new booking"}>Book</button>
        </div>
      </div>
    </aside>
  );
}

function SpecialtyListsScreen({
  data,
  bookings,
  selectedSpecialtyId,
  setSelectedSpecialtyId,
  statusFilter,
  setStatusFilter,
}: {
  data: OrodhaData;
  bookings: EnrichedBooking[];
  selectedSpecialtyId: string;
  setSelectedSpecialtyId: (id: string) => void;
  statusFilter: "All" | "Pending" | "Done" | "Cancelled";
  setStatusFilter: (status: "All" | "Pending" | "Done" | "Cancelled") => void;
}) {
  const selected = data.specialties.find((specialty) => specialty.id === selectedSpecialtyId) || data.specialties[0];
  const rows = bookings
    .filter((booking) => booking.surgicalCase.specialty_id === selected?.id)
    .filter((booking) => statusFilter === "All" || (statusFilter === "Pending" ? booking.booking_status === "Booked" : booking.booking_status === statusFilter))
    .sort((a, b) => a.session.session_date.localeCompare(b.session.session_date));
  return (
    <section className="px-10 py-12">
      <PageHeader title="Specialty Lists" subtitle="All bookings by surgical specialty" />
      <div className="mt-8 flex flex-wrap gap-3">
        {data.specialties.map((specialty) => (
          <button key={specialty.id} className={clsx("rounded-full border px-5 py-2 font-semibold", specialty.id === selectedSpecialtyId ? "border-[var(--green-accent)] bg-[var(--green-deep)] text-white" : "border-[var(--border)] bg-white")} onClick={() => setSelectedSpecialtyId(specialty.id)}>
            {specialty.name} <span className="text-sm opacity-70">{bookings.filter((booking) => booking.surgicalCase.specialty_id === specialty.id).length}</span>
          </button>
        ))}
      </div>
      <div className="mt-7 flex items-center justify-between">
        <div className="flex gap-2">
          {(["All", "Pending", "Done", "Cancelled"] as const).map((status) => (
            <button key={status} className={clsx("rounded-lg border px-4 py-2 font-medium", statusFilter === status ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-[var(--border)] bg-white text-[var(--muted)]")} onClick={() => setStatusFilter(status)}>{status}</button>
          ))}
        </div>
        <div className="text-[var(--muted)]">{rows.length} bookings</div>
      </div>
      <TableShell className="mt-5">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient name</th>
              <th>UMR</th>
              <th>Age</th>
              <th>Procedure</th>
              <th>Urgency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((booking) => (
              <tr key={booking.id}>
                <td className="font-semibold">{format(parseISO(booking.session.session_date), "d MMM")}</td>
                <td className="font-bold">{booking.patient.full_name}</td>
                <td className="font-mono text-sm text-[var(--muted)]">{booking.patient.hospital_number}</td>
                <td className="text-[var(--muted)]">{childAge(booking.patient.date_of_birth, booking.patient.age_text)}</td>
                <td>{booking.surgicalCase.procedure_name}</td>
                <td className={booking.surgicalCase.priority === "Urgent" || booking.surgicalCase.priority === "Emergency" ? "font-bold text-orange-700" : "font-bold text-slate-700"}>{booking.surgicalCase.priority}</td>
                <td><StatusBadge status={booking.booking_status} uiPending /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </section>
  );
}

function TheatreListScreen({ data, bookings, selectedDate, setSelectedDate }: { data: OrodhaData; bookings: EnrichedBooking[]; selectedDate: string; setSelectedDate: (date: string) => void }) {
  const rows = bookings
    .filter((booking) => booking.session.session_date === selectedDate && booking.booking_status !== "Cancelled")
    .sort((a, b) => a.slot - b.slot);
  const session = data.theatre_sessions.find((item) => item.session_date === selectedDate);
  const maxCases = session?.max_cases || 3;
  const activeCases = rows.filter((booking) => isCapacityBooking(booking)).length;
  const availableCases = Math.max(maxCases - activeCases, 0);
  const blockedDay = Boolean(session?.is_blocked);

  function exportCsv() {
    const csv = [
      ["Slot", "Patient", "UMR", "Procedure", "Diagnosis", "Specialty", "Contact"].join(","),
      ...rows.map((booking) =>
        [
          booking.slot,
          booking.patient.full_name,
          booking.patient.hospital_number,
          booking.surgicalCase.procedure_name,
          booking.surgicalCase.diagnosis || "",
          booking.specialty?.name || "",
          booking.patient.phone_primary || "",
        ]
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `orodha-theatre-list-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="px-9 py-6">
      <div className="mb-5 flex items-end justify-between gap-6">
        <PageTitle title="Theatre List" subtitle="Printable daily case list" />
        <div className="flex items-center gap-3">
          <input className="input w-[214px] py-2.5 text-[0.96rem]" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          <button className="btn-primary" onClick={() => { exportCsv(); window.print(); }}>Print / PDF</button>
        </div>
      </div>
      <div id="print-area" className="max-w-[1036px] overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <div className="flex items-start justify-between gap-8 bg-[var(--green-deep)] px-8 py-4 text-white">
          <div className="min-w-0">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#9cc9aa]">Paediatric Surgery Unit</div>
            <div className="mt-1 text-[1.9rem] font-semibold leading-tight">Daily Theatre List</div>
            <div className="mt-1 text-[1rem] text-[#d7eadb]">{format(parseISO(selectedDate), "EEEE, d MMMM yyyy")}</div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-right">
            <div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#9cc9aa]">Listed</div>
              <div className="mt-1 text-[2.15rem] font-semibold leading-none">{rows.length}</div>
            </div>
            <div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#9cc9aa]">Available</div>
              <div className="mt-1 text-[2.15rem] font-semibold leading-none">{availableCases}</div>
            </div>
            <div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#9cc9aa]">Status</div>
              <div className="mt-1 text-sm font-semibold text-[#d7eadb]">{blockedDay ? "Blocked day" : `${activeCases}/${maxCases} active`}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3.5 p-6 print-area">
          {rows.map((booking) => (
            <div key={booking.id} className="print-case-card rounded-xl border border-[var(--border)] px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--green-deep)] text-[1.15rem] font-semibold text-white">#{booking.slot}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[1.55rem] font-semibold leading-tight">{booking.patient.full_name}</div>
                      <div className="mt-1 text-[0.98rem] text-[var(--muted)]">
                        {booking.patient.hospital_number} | {booking.patient.sex} | Age {childAge(booking.patient.date_of_birth, booking.patient.age_text)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={booking.surgicalCase.priority === "Urgent" || booking.surgicalCase.priority === "Emergency" ? "amber" : "slate"}>
                        {booking.surgicalCase.priority}
                      </Badge>
                      <StatusBadge status={booking.booking_status} />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-x-10 gap-y-2.5 md:grid-cols-2">
                    <CompactInfoRow label="Procedure" value={booking.surgicalCase.procedure_name} />
                    <CompactInfoRow label="Specialty" value={booking.specialty?.name || "-"} />
                    <CompactInfoRow label="Diagnosis" value={booking.surgicalCase.diagnosis || "-"} />
                    <CompactInfoRow label="Contact" value={booking.patient.phone_primary || "-"} />
                    <CompactInfoRow label="SHA" value={booking.patient.sha_status} />
                  </div>
                  {booking.preop?.preop_notes && (
                    <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/80 px-4 py-3">
                      <div className="text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-emerald-800">Pre-op notes</div>
                      <div className="mt-1 text-[0.96rem] leading-6 text-emerald-950">{booking.preop.preop_notes}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {Array.from({ length: maxCases }, (_, index) => index + 1)
            .filter((slot) => !rows.some((booking) => booking.slot === slot))
            .map((slot) => (
              <div key={`empty-${slot}`} className="rounded-xl border border-dashed border-[var(--border)] px-5 py-4 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-slate-300">
                Slot {slot} - available
              </div>
            ))}
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-[0.8rem] text-[var(--muted)]">
            <div>Generated {format(today, "d MMM yyyy, HH:mm")}</div>
            <div>Orodha - Paediatric Theatre Management</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UserManagementScreen({
  profiles,
  appUser,
  source,
  data,
  saveProfile,
  clearClinicalData,
  seedDemoWorkspace,
  seedingDemo,
}: {
  profiles: Profile[];
  appUser: AppUser;
  source: "demo" | "supabase";
  data: OrodhaData;
  saveProfile: (profile: Profile) => Promise<void>;
  clearClinicalData: () => Promise<void>;
  seedDemoWorkspace: () => Promise<void>;
  seedingDemo: boolean;
}) {
  const supportedRoles: UserRole[] = ["Admin", "Surgeon", "Anaesthetist"];
  const clinicalRows =
    data.patients.length +
    data.theatre_sessions.length +
    data.surgical_cases.length +
    data.preop_assessments.length +
    data.bookings.length +
    data.case_notes.length;
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (a.id === appUser.id) return -1;
    if (b.id === appUser.id) return 1;
    if (a.approved !== b.approved) return a.approved ? 1 : -1;
    return a.full_name.localeCompare(b.full_name);
  });

  return (
    <section className="px-10 py-12">
      <PageHeader title="Admin" subtitle="Manage access and prepare the workspace for clinical use" />

      <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
              <UserCog size={22} />
            </div>
            <div>
              <div className="text-lg font-bold">User access</div>
              <p className="mt-1 max-w-[620px] text-sm leading-6 text-[var(--muted)]">
                Approve new accounts and assign Admin, Surgeon, or Anaesthetist roles. Non-admin clinical users remain read-only.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {source === "supabase"
              ? "Changes here update the shared profiles table immediately."
              : "Demo mode keeps these access changes in this browser only."}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <Database size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-bold">Workspace data</div>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Clear demo clinical records before entering real patients. Reference lists and users are kept.
                  </p>
                </div>
                <Badge tone={clinicalRows > 0 ? "amber" : "slate"}>{clinicalRows} rows</Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="btn-secondary min-h-0 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={seedDemoWorkspace}
                  disabled={source !== "supabase" || seedingDemo}
                  title={source !== "supabase" ? "Demo loading is only needed for Supabase workspaces." : "Load starter demo data"}
                >
                  {seedingDemo ? "Loading demo..." : "Load demo data"}
                </button>
                <button
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={clearClinicalData}
                  disabled={clinicalRows === 0}
                  title="Clear patients, bookings, cases, theatre sessions, pre-op assessments, and notes"
                >
                  Clear clinical data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-9">
        <PageHeader title="Users" subtitle="Approve accounts and assign clinical access roles" />
      </div>
      <TableShell className="mt-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProfiles.map((profile) => {
              const isSelf = profile.id === appUser.id;
              const canManage = !isSelf;
              return (
                <tr key={profile.id}>
                  <td>
                    <div className="font-semibold">{profile.full_name}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{profile.id}</div>
                  </td>
                  <td>
                    <select
                      className="input h-10 min-w-[160px] py-2"
                      value={profile.role}
                      disabled={!canManage}
                      onChange={(event) => saveProfile({ ...profile, role: event.target.value as UserRole })}
                      title={isSelf ? "You cannot change your own role here." : "Assign a role"}
                    >
                      {supportedRoles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Badge tone={profile.approved ? "green" : "amber"}>{profile.approved ? "Approved" : "Pending"}</Badge>
                  </td>
                  <td className="text-[var(--muted)]">{profile.phone || "-"}</td>
                  <td className="text-[var(--muted)]">{format(parseISO(profile.created_at), "d MMM yyyy")}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn-secondary min-h-0 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!canManage}
                        onClick={() => saveProfile({ ...profile, approved: !profile.approved })}
                        title={isSelf ? "You cannot change your own approval status here." : profile.approved ? "Suspend this account" : "Approve this account"}
                      >
                        {profile.approved ? "Suspend" : "Approve"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableShell>
    </section>
  );
}

function AuditLogScreen({ bookings, appUser }: { bookings: EnrichedBooking[]; appUser: AppUser }) {
  const rows = [
    ...bookings.slice(0, 8).map((booking) => ({
      timestamp: format(parseISO(booking.updated_at), "yyyy-MM-dd HH:mm"),
      user: booking.booking_status === "Done" ? "Dr. A. Oduya" : appUser.name,
      action: booking.booking_status === "Done" ? "Status → Done" : booking.booking_status === "Cancelled" ? "Status → Cancelled" : "Booking created",
      target: `${booking.id.slice(0, 4)} - ${booking.patient.full_name}`,
    })),
    { timestamp: "2026-04-15 09:00", user: appUser.name, action: "Date blocked", target: "2026-05-01 Labour Day" },
  ];
  return (
    <section className="px-10 py-12">
      <PageHeader title="Audit Log" subtitle="All booking actions - timestamped and attributable" />
      <TableShell className="mt-8">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Target record</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.timestamp}-${index}`}>
                <td className="font-mono text-sm text-[var(--muted)]">{row.timestamp}</td>
                <td className="font-bold">{row.user}</td>
                <td><AuditBadge action={row.action} /></td>
                <td className="text-[var(--muted)]">{row.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </section>
  );
}

function NewPatientScreen({ back, save }: { back: () => void; save: (patient: Patient) => Promise<void> }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const patient: Patient = {
      id: createId("patient"),
      hospital_number: String(form.get("hospital_number") || "").toUpperCase(),
      full_name: String(form.get("full_name") || ""),
      sex: String(form.get("sex") || "Unknown") as Sex,
      date_of_birth: String(form.get("date_of_birth") || "") || null,
      age_text: null,
      residence: String(form.get("residence") || "") || null,
      caregiver_name: null,
      phone_primary: String(form.get("phone_primary") || "") || null,
      phone_secondary: String(form.get("phone_secondary") || "") || null,
      sha_status: String(form.get("sha_status") || "Active") as ShaStatus,
      notes: null,
      created_at: todayIso(),
      updated_at: todayIso(),
    };
    await save(patient);
  }
  return (
    <section className="px-14 py-12">
      <BackTitle title="New Patient Record" back={back} />
      <form onSubmit={submit} className="mt-10 max-w-[930px] rounded-2xl border border-[var(--border)] bg-white p-11 shadow-[var(--shadow-card)]">
        <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
          <Field label="UMR *" className="md:col-span-2">
            <input className="input" name="hospital_number" placeholder="UMR048215" pattern="UMR[0-9]{4,7}" required />
            <div className="mt-1 text-sm text-[var(--muted)]">Format: UMR + 4-7 digits, uppercase</div>
          </Field>
          <Field label="Full name *" className="md:col-span-2"><input className="input" name="full_name" placeholder="Patient's full name" required /></Field>
          <Field label="Sex *"><SelectBare name="sex" options={sexOptions} /></Field>
          <Field label="Date of birth *"><input className="input" type="date" name="date_of_birth" required /></Field>
          <Field label="Primary phone *"><input className="input" name="phone_primary" placeholder="0712 345 678" required /></Field>
          <Field label="Secondary phone"><input className="input" name="phone_secondary" placeholder="Optional" /></Field>
          <Field label="Residence"><input className="input" name="residence" placeholder="e.g. Nairobi" /></Field>
          <Field label="SHA status"><SelectBare name="sha_status" options={shaOptions} defaultValue="Active" /></Field>
        </div>
        <div className="mt-8 flex justify-end border-t border-[var(--border)] pt-7">
          <button className="btn-primary px-6 text-lg" type="submit">Save patient record</button>
        </div>
      </form>
    </section>
  );
}

function NewBookingScreen({
  data,
  step,
  setStep,
  patientId,
  setPatientId,
  search,
  setSearch,
  defaultDate,
  back,
  newPatient,
  saveCase,
  savePreop,
  saveSession,
  saveBooking,
  done,
}: {
  data: OrodhaData;
  step: BookingStep;
  setStep: (step: BookingStep) => void;
  patientId: string | null;
  setPatientId: (id: string) => void;
  search: string;
  setSearch: (query: string) => void;
  defaultDate: string;
  back: () => void;
  newPatient: () => void;
  saveCase: (surgicalCase: SurgicalCase) => Promise<void>;
  savePreop: (preop: OrodhaData["preop_assessments"][number]) => Promise<void>;
  saveSession: (session: TheatreSession) => Promise<void>;
  saveBooking: (booking: Booking) => Promise<void>;
  done: (date: string) => void;
}) {
  const [bookingDate, setBookingDate] = useState(defaultDate);
  const [formError, setFormError] = useState("");
  const selectedPatient = patientId ? data.patients.find((patient) => patient.id === patientId) || null : null;
  const searchTerm = search.trim().toLowerCase();
  const results = searchTerm
    ? data.patients.filter((patient) => [patient.full_name, patient.hospital_number].some((value) => value.toLowerCase().includes(searchTerm)))
    : [];
  const selectedBookingSession = useMemo(
    () => data.theatre_sessions.find((item) => item.session_date === bookingDate) || null,
    [bookingDate, data.theatre_sessions],
  );
  const selectedBookingCapacity = useMemo(
    () => (selectedBookingSession ? capacityForSession(data, selectedBookingSession) : { booked: 0, isFull: false }),
    [data, selectedBookingSession],
  );
  const isSelectedBookingDateFull = selectedBookingCapacity.isFull;
  const isSelectedBookingDatePast = isPastTheatreDate(bookingDate);
  const isSelectedBookingDateBlocked = Boolean(selectedBookingSession?.is_blocked);
  const selectedBookingAvailableSlots = useMemo(
    () => availableSlotsForDate(data, bookingDate, selectedBookingSession),
    [bookingDate, data, selectedBookingSession],
  );
  const cannotConfirmBooking =
    !selectedPatient ||
    isSelectedBookingDateFull ||
    isSelectedBookingDatePast ||
    isSelectedBookingDateBlocked ||
    selectedBookingAvailableSlots.length === 0;

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cannotConfirmBooking) return;
    setFormError("");
    try {
      const form = new FormData(event.currentTarget);
      const date = bookingDate;
      let session = data.theatre_sessions.find((item) => item.session_date === date);
      if (!session) {
        session = {
          id: createId("session"),
          theatre_id: data.theatres[0]?.id || "",
          session_date: date,
          session_name: "Paediatric Surgery List",
          max_cases: 3,
          start_time: "08:00",
          end_time: "16:00",
          is_blocked: false,
          block_reason: null,
          notes: null,
          created_at: todayIso(),
        };
        await saveSession(session);
      }
      const specialtyId = String(form.get("specialty_id"));
      const caseId = createId("case");
      const selectedSlot = Number(form.get("slot") || selectedBookingAvailableSlots[0] || 1);
      const surgicalCase: SurgicalCase = {
        id: caseId,
        patient_id: selectedPatient.id,
        specialty_id: specialtyId,
        procedure_id: null,
        procedure_name: String(form.get("procedure_name")),
        diagnosis: String(form.get("diagnosis") || "") || null,
        indication: null,
        case_description: null,
        priority: String(form.get("priority") || "Elective") as SurgicalCase["priority"],
        status: "Booked",
        estimated_duration_minutes: Number(form.get("estimated_duration_minutes") || 0) || null,
        weight_kg: null,
        asa_class: null,
        comorbidities: null,
        allergies: null,
        special_requirements: String(form.get("preop_notes") || "") || null,
        surgeon_id: null,
        anaesthetist_id: null,
        created_at: todayIso(),
        updated_at: todayIso(),
      };
      const booking: Booking = {
        id: createId("booking"),
        case_id: caseId,
        session_id: session.id,
        slot: selectedSlot,
        booking_status: "Booked",
        order_on_list: selectedSlot,
        postop_destination: null,
        cancellation_reason: null,
        postponement_reason: null,
        outcome_notes: null,
        created_at: todayIso(),
        updated_at: todayIso(),
      };
      await saveCase(surgicalCase);
      await savePreop({ ...defaultPreop(caseId), preop_notes: String(form.get("preop_notes") || "") || null });
      await saveBooking(booking);
      done(date);
    } catch (error) {
      setFormError(describeError(error));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/35 px-4 py-8 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label="New booking">
    <section className="relative w-full max-w-[880px] rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-7 shadow-2xl">
      <button className="icon-button absolute right-5 top-5" aria-label="Close booking modal" onClick={back}><X size={18} /></button>
      <BackTitle title="New Booking" subtitle={step === "patient" ? "Step 1 of 2 - Select patient" : "Step 2 of 2 - Booking details"} back={back} />
      <div className="mt-6 inline-flex overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <button className={clsx("px-6 py-2.5 text-base font-semibold", step === "patient" ? "bg-[var(--green-deep)] text-white" : "text-[var(--green-deep)]")} onClick={() => setStep("patient")}>{step === "details" ? "✓ " : ""}Patient</button>
        <button className={clsx("px-6 py-2.5 text-base font-semibold", step === "details" ? "bg-[var(--green-deep)] text-white" : "text-[var(--muted)]")} disabled={!selectedPatient} onClick={() => setStep("details")}>Details</button>
      </div>
      {isSelectedBookingDatePast && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
          <div className="font-semibold">{format(parseISO(bookingDate), "d MMMM yyyy")} is in the past.</div>
          <div className="mt-1">Choose today or a future theatre date before confirming the booking.</div>
        </div>
      )}
      {isSelectedBookingDateFull && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="font-semibold">{format(parseISO(bookingDate), "d MMMM yyyy")} is already fully booked.</div>
          <div className="mt-1">You can still continue here, then choose a different theatre date before confirming the booking.</div>
        </div>
      )}
      {isSelectedBookingDateBlocked && (
        <div className="mt-5 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
          <div className="font-semibold">{format(parseISO(bookingDate), "d MMMM yyyy")} is blocked.</div>
          <div className="mt-1">{selectedBookingSession?.block_reason || "Choose another theatre date before confirming the booking."}</div>
        </div>
      )}
      {step === "patient" ? (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-7">
          <h2 className="text-xl font-bold">Find or create patient</h2>
          <SearchInput className="mt-5" value={search} onChange={setSearch} placeholder="Search by name or UMR..." />
          <div className="mt-4 space-y-2.5">
            {results.slice(0, 4).map((patient) => (
              <button key={patient.id} className={clsx("flex w-full items-center justify-between rounded-xl border p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/60", patientId === patient.id ? "border-emerald-200 bg-emerald-50" : "border-[var(--border)] bg-white")} onClick={() => setPatientId(patient.id)}>
                <span>
                  <span className="block text-base font-semibold">{patient.full_name}</span>
                  <span className="text-[var(--muted)]">{patient.hospital_number} · {patient.sex} · {childAge(patient.date_of_birth, patient.age_text)} · {patient.residence}</span>
                </span>
                {patientId === patient.id && <Check className="text-[var(--green-accent)]" />}
              </button>
            ))}
          </div>
          {selectedPatient && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-[var(--green-deep)]">Selected patient</div>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoRow label="Name" value={selectedPatient.full_name} />
                <InfoRow label="UMR" value={selectedPatient.hospital_number} />
                <InfoRow label="DOB" value={selectedPatient.date_of_birth ? `${format(parseISO(selectedPatient.date_of_birth), "dd/MM/yyyy")} (${childAge(selectedPatient.date_of_birth, selectedPatient.age_text)})` : "-"} />
                <InfoRow label="Sex" value={selectedPatient.sex} />
                <InfoRow label="Residence" value={selectedPatient.residence || "-"} />
                <InfoRow label="SHA" value={selectedPatient.sha_status} />
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <button className="btn-secondary" onClick={newPatient}>+ New patient</button>
            <button className="btn-primary" disabled={!selectedPatient} onClick={() => setStep("details")}>Continue →</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submitBooking} className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-7">
          <h2 className="text-xl font-bold">Booking details</h2>
          {formError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {formError}
            </div>
          )}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Theatre date *">
              <input className="input" type="date" name="session_date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} required />
              {isSelectedBookingDatePast && <div className="mt-2 text-sm font-medium text-slate-700">Only today or future dates can have bookings.</div>}
              {isSelectedBookingDateFull && <div className="mt-2 text-sm font-medium text-amber-800">This date already has {selectedBookingCapacity.booked}/{selectedBookingSession?.max_cases || 3} slots filled. Please choose another day.</div>}
              {isSelectedBookingDateBlocked && <div className="mt-2 text-sm font-medium text-slate-700">This theatre date is blocked. Please choose another day.</div>}
            </Field>
            <Field label="Slot *">
              <SelectBare
                name="slot"
                options={selectedBookingAvailableSlots.length ? selectedBookingAvailableSlots.map((slot) => `Slot ${slot}`) : [{ value: "", label: "No available slot" }]}
                disabled={cannotConfirmBooking}
              />
            </Field>
            <Field label="Specialty *"><SelectBare name="specialty_id" options={data.specialties.map((item) => ({ value: item.id, label: item.name }))} /></Field>
            <Field label="Urgency"><SelectBare name="priority" options={["Elective", "Semi-urgent", "Urgent", "Emergency"]} /></Field>
            <Field label="Procedure *" className="md:col-span-2"><input className="input" name="procedure_name" placeholder="e.g. Orchidopexy" required /></Field>
            <Field label="Diagnosis" className="md:col-span-2"><input className="input" name="diagnosis" placeholder="e.g. Undescended testis" /></Field>
            <Field label="Est. duration (min)"><input className="input" type="number" name="estimated_duration_minutes" placeholder="60" /></Field>
            <Field label="Pre-operative notes" className="md:col-span-2"><textarea className="input min-h-20" name="preop_notes" placeholder="Anaesthetic considerations, investigations, consents..." /></Field>
          </div>
          <div className="mt-7 flex justify-between border-t border-[var(--border)] pt-6">
            <button className="btn-secondary" type="button" onClick={() => setStep("patient")}>← Back</button>
            <button className="btn-primary px-6 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={cannotConfirmBooking}>Confirm booking</button>
          </div>
        </form>
      )}
    </section>
    </div>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <PageTitle title={title} subtitle={subtitle} />
      {action}
    </div>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-[1.6rem] font-bold leading-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-base text-[var(--muted)]">{subtitle}</p>}
    </div>
  );
}

function BackTitle({ title, subtitle, back }: { title: string; subtitle?: string; back: () => void }) {
  return (
    <div className="flex items-start gap-5">
      <button className="mt-2 text-[var(--muted)]" onClick={back}><ArrowLeft /></button>
      <PageTitle title={title} subtitle={subtitle} />
    </div>
  );
}

function BlockDayModal({
  date,
  reason,
  setReason,
  cancel,
  confirm,
}: {
  date: string;
  reason: string;
  setReason: (value: string) => void;
  cancel: () => void;
  confirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label="Block theatre date">
      <div className="w-full max-w-[560px] rounded-[1.65rem] border border-black/5 bg-white p-8 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
        <div className="text-[1.15rem] font-bold">Block theatre date</div>
        <div className="mt-1 text-base text-[var(--muted)]">{format(parseISO(date), "EEEE d MMMM")}</div>
        <div className="mt-7">
          <Field label="Reason for blocking *">
            <input
              autoFocus
              className="input h-11 text-[0.96rem]"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Equipment maintenance, Training day..."
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--line)] pt-5">
          <button className="btn-secondary px-5" onClick={cancel}>Cancel</button>
          <button className="rounded-xl bg-[#ef2f2f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d82727]" disabled={!reason.trim()} onClick={confirm}>Block date</button>
        </div>
      </div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <div className={clsx("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
      <input className="input h-10 text-[0.96rem] leading-none" style={{ paddingLeft: "2.35rem", paddingRight: "0.8rem" }} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function CalendarLegend() {
  return (
    <div className="hidden items-center gap-3 text-[var(--muted)] xl:flex">
      <Legend color="bg-emerald-100 border-emerald-200" label="1" />
      <Legend color="bg-amber-100 border-amber-200" label="2" />
      <Legend color="bg-red-100 border-red-200" label="Full" />
      <Legend color="bg-slate-200 border-slate-300" label="Blocked" />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className={clsx("size-5 rounded border", color)} />{label}</span>;
}

function Avatar({ appUser }: { appUser: AppUser }) {
  return <div className="grid size-10 place-items-center rounded-full bg-[var(--green-deep)] text-sm font-bold text-white">{appUser.initials}</div>;
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <label className={clsx("block text-base font-semibold", className)}><span className="mb-2 block">{label}</span>{children}</label>;
}

function SelectBare({
  name,
  options,
  defaultValue,
  disabled,
}: {
  name: string;
  options: (string | { value: string; label: string })[];
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <select className="input disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400" name={name} defaultValue={defaultValue} disabled={disabled}>
      {options.map((option) => {
        const value = typeof option === "string" ? option.replace("Slot ", "") : option.value;
        const label = typeof option === "string" ? option : option.label;
        return <option key={value} value={value}>{label}</option>;
      })}
    </select>
  );
}

function StatusBadge({ status, uiPending }: { status: BookingStatus; uiPending?: boolean }) {
  const label = uiPending && status === "Booked" ? "Pending" : status;
  const tone = status === "Done" ? "green" : status === "Cancelled" || status === "No-show" ? "red" : status === "Postponed" ? "slate" : "amber";
  return <Badge tone={tone}>{label}</Badge>;
}

function ShaBadge({ status }: { status: ShaStatus }) {
  return <Badge tone={status === "Active" ? "green" : "slate"}>{status}</Badge>;
}

function Badge({ tone, children }: { tone: "green" | "amber" | "red" | "slate" | "blue"; children: ReactNode }) {
  return <span className={clsx("inline-flex rounded-md px-3 py-1 text-sm font-bold", badgeClass(tone))}>{children}</span>;
}

function AuditBadge({ action }: { action: string }) {
  const tone = action.includes("Done") ? "green" : action.includes("Cancelled") ? "red" : action.includes("Pre-op") ? "amber" : action.includes("blocked") ? "slate" : "blue";
  return <Badge tone={tone}>{action}</Badge>;
}

function TableShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("overflow-hidden rounded-2xl border border-[var(--border)] bg-white", className)}>{children}</div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-bold uppercase tracking-[0.06em] text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-lg font-medium">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-4">
      <div className="text-[var(--muted)]">{label}:</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function CompactInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3">
      <div className="text-[0.79rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</div>
      <div className="text-[0.98rem] font-medium text-[var(--text)]">{value}</div>
    </div>
  );
}

function EmptySlot({ slot }: { slot: number }) {
  return <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-[var(--muted)]">Slot {slot} - available</div>;
}

const capacityBookingStatuses: BookingStatus[] = ["Booked", "Done", "No-show"];

function isCapacityBooking(booking: Pick<Booking, "booking_status">) {
  return capacityBookingStatuses.includes(booking.booking_status);
}

function isPastTheatreDate(date: string) {
  return date < today;
}

function availableSlotsForDate(data: OrodhaData, date: string, session: TheatreSession | null) {
  const maxCases = session?.max_cases || 3;
  const occupiedSlots = new Set(
    data.bookings
      .filter((booking) => booking.session_id === session?.id && isCapacityBooking(booking))
      .map((booking) => booking.slot),
  );

  return Array.from({ length: maxCases }, (_, index) => index + 1).filter((slot) => !occupiedSlots.has(slot));
}

function describeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const maybe = error as { message?: string; details?: string; hint?: string; code?: string };
    const message = [maybe.message, maybe.details, maybe.hint, maybe.code ? `(${maybe.code})` : ""].filter(Boolean).join(" ");
    if (message) return message;
  }
  return "Something went wrong while saving. Please try again.";
}

function calendarCellTone(session?: TheatreSession, capacity?: { booked: number; isFull: boolean } | null, isWeekend = false) {
  if (!session) return isWeekend ? "border-slate-200 bg-slate-100 text-slate-300" : "bg-white text-slate-300";
  if (session.is_blocked) return "border-slate-400 bg-slate-200 text-slate-700";
  if (capacity?.isFull) return "border-red-300 bg-red-100 text-red-700";
  if ((capacity?.booked || 0) >= 2) return "border-amber-300 bg-amber-100 text-amber-800";
  if ((capacity?.booked || 0) >= 1) return "border-emerald-200 bg-emerald-100 text-emerald-800";
  return isWeekend ? "border-slate-200 bg-slate-100 text-slate-300" : "bg-white text-slate-300";
}

function badgeClass(tone: "green" | "amber" | "red" | "slate" | "blue") {
  return {
    green: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    red: "bg-red-50 text-red-800 ring-1 ring-red-200",
    slate: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  }[tone];
}

function replaceById<T extends { id: string }>(items: T[], row: T) {
  return items.some((item) => item.id === row.id) ? items.map((item) => (item.id === row.id ? row : item)) : [row, ...items];
}

function virtualSession(date: string, data: OrodhaData): TheatreSession {
  return {
    id: `virtual-${date}`,
    theatre_id: data.theatres[0]?.id || "",
    session_date: date,
    session_name: "Paediatric Surgery List",
    max_cases: 3,
    start_time: "08:00",
    end_time: "16:00",
    is_blocked: false,
    block_reason: null,
    notes: null,
    created_at: todayIso(),
  };
}

function defaultPreop(caseId: string): OrodhaData["preop_assessments"][number] {
  return {
    id: createId("preop"),
    case_id: caseId,
    anaesthesia_status: "Not assessed",
    surgical_status: "Not assessed",
    nursing_status: "Not assessed",
    consent_done: false,
    fasting_instructions_given: false,
    labs_required: false,
    labs_done: false,
    imaging_required: false,
    imaging_done: false,
    blood_required: false,
    blood_available: false,
    financial_clearance: false,
    preop_notes: null,
    assessed_at: null,
    updated_at: todayIso(),
  };
}

