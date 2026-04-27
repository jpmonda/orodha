# Orodha

Paediatric theatre scheduling and surgical case management app built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## What Is Included

- Dashboard, patient registry, surgical cases, theatre calendar, theatre bookings, printable/exportable daily theatre list, pre-op readiness checklist, and settings/reference data.
- CRUD flows for patients, surgical cases, pre-op assessments, theatre sessions, bookings, and case notes.
- Login page with role-aware access for Admin, Surgeon, and Anaesthetist.
- Admin-only in-app user management screen for approving users and assigning `Admin`, `Surgeon`, or `Anaesthetist`.
- Demo data mode using browser local storage, so the workflow runs before Supabase is connected.
- Supabase integration using the redesigned schema in `orodha_redesigned_schema.sql`.

## Install

```bash
npm install
```

## Environment

Create `.env.local` from `.env.local.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`SUPABASE_SERVICE_ROLE_KEY` is not used by the current app. Only add it later for server-only admin jobs or API routes.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

Without Supabase env vars, Orodha runs in demo mode and offers demo sign-in buttons for Admin, Surgeon, and Anaesthetist. With env vars, sign in from the login page and the app reads/writes Supabase tables through the anon key and RLS policies.

## Apply Supabase Schema

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `orodha_redesigned_schema.sql`.
4. Run `supabase_process_migration.sql` for audit triggers, joined booking views, and a safe postpone/rebook RPC.
5. Run `supabase_auth_roles_migration.sql` to align database writes with the app's role-based access.
6. Run `supabase_seed_demo.sql` for sample data.
7. Create a user in Supabase Auth.
8. Approve that user:

```sql
update public.profiles
set approved = true, role = 'Admin'
where id = '<auth-user-id>';
```

The schema keeps booking history: postponing/rebooking updates the old booking row and creates a new booking row for the new theatre appearance. Prefer the `postpone_and_rebook(...)` RPC from `supabase_process_migration.sql` when wiring production actions.

Current role behavior in the app:

- `Admin`: full access
- `Surgeon`: read-only access to calendar, patients, specialty lists, and theatre list
- `Anaesthetist`: read-only access to calendar, patients, specialty lists, and theatre list

## Verify

```bash
npm run lint
npm run build
```

## Deploy To Vercel

1. Push the repository to GitHub.
2. Import it in Vercel as a Next.js project.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy.

The app is desktop-first with responsive mobile cards and mobile navigation. The daily theatre list can be printed with the Print button or exported as CSV.
