# Orodha — Developer Handoff

**Version:** 1.0 | **Date:** April 2026 | **Status:** Ready for development

---

## Overview

Orodha is a purpose-built web application for the Paediatric Surgery Unit at a major Nairobi referral hospital. It replaces a Google Sheets workbook for theatre booking management, enforcing data integrity, capturing operative outcomes, and providing a printable daily theatre list.

**Target stack:** React + Vite (frontend) · Supabase (PostgreSQL + Auth + RLS) · Tailwind CSS · Deployed on Vercel

---

## About the Design Files

The HTML files in this bundle (`Orodha.html` and `orodha-*.jsx`) are **high-fidelity design prototypes** built in React/JSX with inline styles. They are reference implementations — not production code. The task is to **recreate these designs in the target codebase** using Vite + React + Tailwind CSS + Supabase, following the patterns described in `project-structure.md`.

Do **not** ship the prototype HTML files directly. Use them as a visual and behavioural reference.

**Fidelity:** High-fidelity. Pixel-accurate colours, typography, spacing, and interactions. Recreate the UI as closely as possible using Tailwind CSS utility classes.

---

## Design Tokens

### Colours
```css
/* CSS variables — define in index.css */
:root {
  --green-deep:    oklch(28% 0.09 155);   /* approx #1e4d35 — sidebar, primary buttons */
  --green-mid:     oklch(38% 0.11 155);   /* approx #2d6645 — hover states */
  --green-accent:  oklch(50% 0.14 155);   /* approx #3a8a5a — active nav, links, focus rings */
  --green-light:   oklch(95% 0.04 155);   /* approx #eaf5ee — selected state backgrounds */
  --bg:            oklch(98.5% 0.004 90); /* approx #faf9f7 — page background (warm off-white) */
  --text:          oklch(20% 0.03 155);   /* approx #1c2b22 — primary text */
  --muted:         oklch(56% 0.03 155);   /* approx #6b7c71 — secondary text, labels */
  --border:        oklch(91% 0.01 155);   /* approx #e3e8e5 — dividers, card borders */
}
```

**Semantic status colours (Tailwind equivalents):**
| State | Background | Text | Border |
|---|---|---|---|
| Pending | `yellow-50` | `yellow-700` | `yellow-200` |
| Done | `green-50` | `green-800` | `green-200` |
| Cancelled | `red-50` | `red-800` | `red-200` |
| Blocked date | `slate-100` | `slate-500` | `slate-200` |
| 1 booking | `green-100` | `green-800` | `green-200` |
| 2 bookings | `yellow-100` | `yellow-800` | `yellow-200` |
| 3 bookings (full) | `red-100` | `red-800` | `red-200` |

### Typography
- **Font:** `Plus Jakarta Sans` (Google Fonts) — weights 400, 500, 600, 700
- **Fallback:** `system-ui, sans-serif`
- **Base size:** 14px (body), 13px (table cells), 11–12px (labels/badges)
- **Headings:** 18–20px, weight 700, letter-spacing −0.3px

### Spacing & Shape
- **Border radius:** cards 12px, buttons 8px, badges 4px, inputs 8px
- **Card shadow:** `0 1px 8px rgba(0,0,0,0.04)`
- **Sidebar width:** 224px (desktop)
- **Top bar height:** 52px (desktop), 54px (mobile)
- **Bottom nav height:** 60px + safe-area-inset-bottom (mobile)
- **Day panel / detail panel width:** 330px

---

## Screens & Components

### 1. Login (`/login`)
**Layout:** Centred card (max-width 400px) on `--bg` background. On mobile: green header panel + white bottom sheet filling remaining height.

**Components:**
- App logo mark: 50×50px, border-radius 13px, `--green-deep` background, white SVG grid icon
- App name: 24px/700, `--text`
- Subtitle: 13.5px/400, `--muted`
- Email + password inputs: full-width, 9px/12px padding, 1px `--border` border, focus ring `--green-accent`
- Submit button: full-width, 12px padding, `--green-deep` bg, white text, 700 weight
- Forgot password link: `--green-accent`, 13px
- Footer note: 12px, `--muted`, centred

**Behaviour:**
- Loading state: button text → "Signing in…", background → `--green-mid`
- Error state: red banner below password field (`red-50` bg, `red-200` border, `red-700` text)
- On success: redirect to `/` (calendar)

**Auth roles (Supabase):** `Admin` · `Surgeon` · `Anaesthetist` — role stored in `profiles.role`

---

### 2. Shell Layout (authenticated)

**Desktop:**
```
┌─────────────┬─────────────────────────────────────────┐
│  Sidebar    │  Top bar (52px)                         │
│  (224px)    ├─────────────────────────────────────────┤
│             │  Screen content (flex, scrollable)      │
│             │                                         │
└─────────────┴─────────────────────────────────────────┘
```

**Sidebar contents (top → bottom):**
- Logo area (28px top padding): 34×34 icon + "Orodha" title + subtitle
- Nav items (flex-col, 12px padding): icon (16px) + label, active = `--green-accent` bg + white text
- User card (bottom, border-top): avatar initials circle + name + role

**Top bar:** date string left · global search (200px) + user pill right

**Mobile:**
- Green top bar (54px): logo + screen title + "+ Book" button
- Screen content fills remaining height above bottom nav
- Bottom nav (4 tabs): Calendar, Patients, Lists, Print — icon + label, active in `--green-accent`

---

### 3. Theatre Calendar (`/`)

**Desktop layout:** Top bar with title + Legend + "New Booking" button. Main area: annual grid (month rows) + day detail panel (330px, right side).

**Annual grid:**
- 12 rows (one per month) + 31 columns (one per day)
- Month label: 88px wide, 12px/600, `--text`
- Day cell: 26px height, 5px border-radius
- Cell colours: see status colour table above
- Today: `box-shadow: 0 0 0 2px var(--green-accent)`
- Selected: `border: 2px solid var(--green-accent)`
- Weekend + empty: `#f9fafb` bg
- Past + empty: 40% opacity
- Blocked: slate cell + lock icon (SVG)
- Hover: `transform: scale(1.18)` transition 0.1s
- Click: opens day detail panel

**Mobile layout:** Week strip (7 days, current week) with prev/next navigation + upcoming bookings list below.

**Week strip day cell:** 52px height, 10px border-radius, date number + booking count, today highlighted.

---

### 4. Day Detail Panel

Opens as a **right panel (330px)** on desktop, **bottom sheet** on mobile (slides up, drag handle, max 90vh).

**Contents:**
- Header: day name (uppercase, muted, 11px) + date (17px/700) + block badge if blocked + Close button
- Admin only: 🔒/🔓 Block/Unblock button (top-right, beside close)
- Slot count badge: "X/3 slots booked" + "+ Book slot" button if slots available
- 3 slot cards (one per slot number):
  - Empty slot: dashed border, "Slot N — available"
  - Booked slot: status-coloured card with patient name, UMR, age, sex, procedure, specialty, urgency, pre-op notes, cancellation reason
  - Pending + Admin/Surgeon: "✓ Mark Done" (green) + "✕ Cancel" (red) action buttons
- Footer: "Print Theatre List" button (full-width, secondary style)

**Status update flows:**
- **Mark Done:** opens `ConfirmModal` → on confirm, `UPDATE bookings SET status='Done'`
- **Cancel:** opens `CancellationModal` → reason picker → on confirm, `UPDATE bookings SET status='Cancelled', cancellation_reason=...`

---

### 5. New Booking (`/bookings/new`)

**2-step form:**

**Step 1 — Patient:**
- Search input with magnifier icon; live-filters patients by name or UMR (min 2 chars)
- Results list: name + UMR + age + sex + residence, click to select
- Selected patient summary card: green-50 bg, 6 fields in 2-col grid
- "+ New patient" secondary button

**Step 2 — Booking Details:**
- 2-col grid (1-col on mobile): Theatre date (date picker), Slot (dropdown, shows available/taken), Specialty (dropdown, 8 options), Urgency (Elective/Urgent/Emergency), Procedure (text, required), Diagnosis (text), Est. duration (number, minutes), Pre-op notes (textarea)
- Validation: red border + error message on required fields
- Slot availability: computed from existing bookings on chosen date
- Full-date warning: inline error if 3 bookings already exist
- Confirm button → success screen with booking summary

**Validation rules:**
| Field | Rule |
|---|---|
| Theatre date | Required, within 2026 |
| Slot | Required; must be 1, 2, or 3; must not be taken |
| Specialty | Required; one of 8 values |
| Procedure | Required, non-empty string |
| Max per day | 3 — return error if exceeded (DB trigger is the authority) |

---

### 6. New Patient (`/patients/new`)

**Single-page form (2-col grid, 1-col mobile):**

| Field | Type | Validation |
|---|---|---|
| UMR | text | Required; regex `/^UMR\d{4,7}$/`; auto-uppercased |
| Full name | text | Required |
| Sex | select | Male / Female |
| Date of birth | date | Required; must not be in future; auto-calculates displayed age |
| Primary phone | text | Required; stored as text (preserve leading zeros) |
| Secondary phone | text | Optional |
| Residence | text | Optional |
| SHA status | select | Active / Inactive (default Active) |

On save: check for duplicate UMR (Supabase unique constraint returns error), check near-match names (Levenshtein ≤ 2 — Phase 2).

---

### 7. Patient Registry (`/patients`)

**Desktop:** Left panel = searchable table; right panel (330px) = patient detail + booking history.

**Table columns:** UMR (monospace) · Patient Name · Age/Sex · Residence · SHA status badge · Booking count

**Detail panel contents:** 2-col metadata grid + booking history cards (date, slot, procedure, specialty, status badge) + Edit / Book buttons.

**Mobile:** Card list. Tap to expand inline with Edit + Book buttons.

---

### 8. Specialty Lists (`/lists`)

**Filter controls:**
- Specialty tabs (scrollable on mobile): 8 specialties with booking count badge
- Status filter chips: All / Pending / Done / Cancelled

**Desktop:** Data table — Date · Patient Name · UMR · Age · Procedure · Urgency (coloured weight) · Status badge

**Mobile:** Card stack — name, procedure, date/slot/urgency per card.

**Specialties:** `Urological` · `Colorectal` · `Hernias & Testis` · `Upper GI` · `Hepatobiliary` · `Minor Procedures` · `Oncological` · `Other`

---

### 9. Theatre List (`/theatre-list`)

**Controls:** Date picker + Print/PDF button.

**Print layout (A4):**
- Dark green header: unit name, "Daily Theatre List", date, case count (N/3)
- 3 slot cards: slot number circle + patient name/UMR/age/sex + procedure + specialty + diagnosis + contact + SHA status + pre-op notes (green left-border callout)
- Empty slots shown as dashed placeholder
- Footer: generated timestamp + "Orodha — Paediatric Surgery Theatre Management"

**Print CSS:** `@media print` — hide everything except `#print-area`, set `position: fixed; top: 0; left: 0; width: 100%`

---

### 10. Audit Log (`/audit`)

Admin-only screen. Read-only table/card list of all booking actions.

**Columns:** Timestamp (monospace) · User · Action (coloured badge by type) · Target record

**Action badge colours:** Created = blue · Done = green · Cancelled = red · Blocked = slate · Pre-op note = yellow

---

## Modals

### CancellationModal
Triggered by "✕ Cancel" on a Pending slot card.
- Radio list of 7 reasons (full-width, border highlight on selection)
- "Other" option reveals free-text textarea (required)
- Actions: "Keep booking" (secondary) + "Confirm cancellation" (red/danger)
- Desktop: centred overlay (max-width 480px). Mobile: bottom sheet.

### BlockDateModal
Triggered by 🔒 button in day panel header (Admin only).
- **Blocking:** text input for reason (required)
- **Unblocking:** shows current reason + warning, confirm to remove
- Desktop: centred overlay (max-width 420px). Mobile: bottom sheet.

### ConfirmModal
Generic confirm/cancel for "Mark Done".
- Title + message + Cancel + Confirm buttons.

---

## Interactions & Animations

| Element | Behaviour |
|---|---|
| Calendar day cell hover | `transform: scale(1.18)`, 0.1s ease |
| Modal entrance (desktop) | `fadeIn` — scale 0.97→1 + opacity 0→1, 0.15s |
| Bottom sheet entrance (mobile) | `slideUp` — translateY 40px→0 + opacity 0→1, 0.25s |
| Nav item hover | background → `--sidebar-hover`, 0.15s |
| Input focus | border-color → `--green-accent`, 0.15s |
| Button disabled | background → `--green-mid` |

---

## Role-Based Access Control

| Feature | Admin | Surgeon | Anaesthetist |
|---|---|---|---|
| View calendar & lists | ✓ | ✓ | ✓ |
| Create booking | ✓ | ✓ | — |
| Edit booking fields | ✓ | ✓ | — |
| Update status (Done/Cancel) | ✓ | ✓ | — |
| Add/edit pre-op notes | ✓ | ✓ | ✓ |
| Block/unblock dates | ✓ | — | — |
| View audit log | ✓ | — | — |
| Manage users | ✓ | — | — |

---

## Files in This Bundle

| File | Purpose |
|---|---|
| `Orodha.html` | Main prototype entry point |
| `orodha-data.js` | Mock data (patients, bookings, blocked dates, audit log) |
| `orodha-modals.jsx` | Shared hooks (`useIsMobile`) + modal components |
| `orodha-sidebar.jsx` | Sidebar, mobile top bar, mobile bottom nav, login screen |
| `orodha-calendar.jsx` | Annual grid, week strip, day detail panel |
| `orodha-forms.jsx` | New booking form, new patient form |
| `orodha-lists.jsx` | Patient registry, specialty lists, theatre list, audit log |
| `orodha-app.jsx` | Root app component, lifted state, routing logic |
| `schema.sql` | PostgreSQL schema, triggers, RLS policies |
| `project-structure.md` | Recommended codebase scaffold |
| `supabase-queries.ts` | TypeScript types + Supabase query examples |

---

## Environment Variables (`.env.local`)
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```
