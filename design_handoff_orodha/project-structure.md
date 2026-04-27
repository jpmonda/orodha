# Orodha — Project Structure & Codebase Scaffold

## Tech Stack
| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev server, ESM, excellent DX |
| Styling | Tailwind CSS v3 | Utility-first, mirrors the prototype's inline-style approach |
| Backend | Supabase | PostgreSQL + Auth + RLS + Realtime — minimal ops overhead |
| Routing | React Router v6 | Standard SPA routing |
| State | React Query (TanStack) | Server state, caching, optimistic updates |
| Forms | React Hook Form + Zod | Validation matches rules in README |
| Deployment | Vercel (frontend) + Supabase (backend) | Both have free tiers suitable for low-traffic internal tool |

---

## Initialise the Project

```bash
# 1. Create Vite + React project
npm create vite@latest orodha -- --template react
cd orodha
npm install

# 2. Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-react
npm install react-router-dom
npm install @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install react-hot-toast          # toast notifications
npm install date-fns                  # date helpers

# 3. Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Supabase CLI (optional, for local dev)
npm install -D supabase
npx supabase init
npx supabase start                    # starts local Postgres + Studio
npx supabase db push                  # applies schema.sql
```

---

## Recommended File Structure

```
orodha/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.jsx                    # ReactDOM.createRoot, QueryClient, Router
│   ├── App.jsx                     # Route definitions, auth gate
│   │
│   ├── lib/
│   │   ├── supabase.js             # createClient(url, anonKey)
│   │   └── utils.js                # calcAge(), formatDate(), cn() helper
│   │
│   ├── hooks/
│   │   ├── useAuth.js              # current user + profile + role
│   │   ├── useBookings.js          # useQuery + useMutation for bookings
│   │   ├── usePatients.js          # useQuery + useMutation for patients
│   │   └── useBlockedDates.js      # useQuery + useMutation for blocked_dates
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx         # Desktop nav
│   │   │   ├── MobileNav.jsx       # Bottom tab bar
│   │   │   ├── MobileTopBar.jsx    # Green mobile header
│   │   │   └── TopBar.jsx          # Desktop top bar (search + user pill)
│   │   │
│   │   ├── ui/                     # Reusable primitives
│   │   │   ├── Badge.jsx           # Status / SHA / urgency badges
│   │   │   ├── Button.jsx          # Primary / Secondary / Danger variants
│   │   │   ├── Input.jsx           # Controlled input with error state
│   │   │   ├── Select.jsx          # Controlled select
│   │   │   ├── Textarea.jsx        # Controlled textarea
│   │   │   ├── Modal.jsx           # Overlay + bottom sheet (mobile)
│   │   │   ├── ConfirmModal.jsx    # Generic confirm/cancel
│   │   │   └── EmptyState.jsx      # Empty table/list placeholder
│   │   │
│   │   ├── calendar/
│   │   │   ├── AnnualGrid.jsx      # 12-row × 31-col annual calendar
│   │   │   ├── WeekStrip.jsx       # 7-day mobile week view
│   │   │   ├── DayCell.jsx         # Single day cell (colour, count, hover)
│   │   │   └── DayPanel.jsx        # Right panel / bottom sheet for a day
│   │   │
│   │   ├── bookings/
│   │   │   ├── SlotCard.jsx        # Single slot display with status actions
│   │   │   ├── CancellationModal.jsx
│   │   │   └── BlockDateModal.jsx
│   │   │
│   │   └── patients/
│   │       ├── PatientSearchInput.jsx  # Debounced search → dropdown
│   │       └── PatientDetailPanel.jsx  # Right panel / mobile expansion
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── NewBookingPage.jsx
│   │   ├── NewPatientPage.jsx
│   │   ├── PatientRegistryPage.jsx
│   │   ├── SpecialtyListPage.jsx
│   │   ├── TheatreListPage.jsx
│   │   └── AuditLogPage.jsx
│   │
│   └── styles/
│       └── index.css               # Tailwind directives + CSS variables
│
├── .env.local                      # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── tailwind.config.js
├── vite.config.js
└── index.html
```

---

## Key File Templates

### `src/lib/supabase.js`
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### `src/styles/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --green-deep:    oklch(28% 0.09 155);
  --green-mid:     oklch(38% 0.11 155);
  --green-accent:  oklch(50% 0.14 155);
  --green-light:   oklch(95% 0.04 155);
  --bg:            oklch(98.5% 0.004 90);
  --text:          oklch(20% 0.03 155);
  --muted:         oklch(56% 0.03 155);
  --border:        oklch(91% 0.01 155);
}

body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background-color: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }

/* Animations */
@keyframes fadeIn  { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
@keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* Print: only show #print-area */
@media print {
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  #print-area { position: fixed; top: 0; left: 0; width: 100%; }
}
```

### `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Map CSS variables to Tailwind for use as bg-green-deep etc.
        'green-deep':   'var(--green-deep)',
        'green-mid':    'var(--green-mid)',
        'green-accent': 'var(--green-accent)',
        'green-light':  'var(--green-light)',
        'app-bg':       'var(--bg)',
        'app-text':     'var(--text)',
        'app-muted':    'var(--muted)',
        'app-border':   'var(--border)',
      },
      borderRadius: {
        card:   '12px',
        button: '8px',
        badge:  '4px',
      },
      boxShadow: {
        card: '0 1px 8px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.2)',
      },
      width: {
        sidebar: '224px',
        panel:   '330px',
      },
      height: {
        topbar: '52px',
      },
      animation: {
        'fade-in':  'fadeIn 0.15s ease',
        'slide-up': 'slideUp 0.25s ease',
      },
    },
  },
  plugins: [],
}
```

### `src/main.jsx`
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

### `src/App.jsx`
```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Shell from './components/layout/Shell'
import LoginPage           from './pages/LoginPage'
import CalendarPage        from './pages/CalendarPage'
import NewBookingPage      from './pages/NewBookingPage'
import NewPatientPage      from './pages/NewPatientPage'
import PatientRegistryPage from './pages/PatientRegistryPage'
import SpecialtyListPage   from './pages/SpecialtyListPage'
import TheatreListPage     from './pages/TheatreListPage'
import AuditLogPage        from './pages/AuditLogPage'

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-app-muted">Loading…</div>
  if (!user || !profile?.approved) return <Navigate to="/login" replace />
  if (requiredRole && profile.role !== requiredRole) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Shell /></ProtectedRoute>}>
        <Route index                element={<CalendarPage />} />
        <Route path="bookings/new"  element={<NewBookingPage />} />
        <Route path="patients"      element={<PatientRegistryPage />} />
        <Route path="patients/new"  element={<NewPatientPage />} />
        <Route path="lists"         element={<SpecialtyListPage />} />
        <Route path="theatre-list"  element={<TheatreListPage />} />
        <Route path="audit"         element={<ProtectedRoute requiredRole="Admin"><AuditLogPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}
```

### `src/components/layout/Shell.jsx`
```jsx
import { Outlet } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import Sidebar       from './Sidebar'
import TopBar        from './TopBar'
import MobileTopBar  from './MobileTopBar'
import MobileNav     from './MobileNav'

export default function Shell() {
  const isMobile = useIsMobile()

  if (isMobile) return (
    <div className="flex flex-col h-dvh">
      <MobileTopBar />
      <main className="flex-1 overflow-hidden flex flex-col min-h-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 flex min-h-0 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

---

## Routing Summary

| Path | Component | Access |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/` | `CalendarPage` | All approved |
| `/bookings/new` | `NewBookingPage` | Admin, Surgeon |
| `/patients` | `PatientRegistryPage` | All approved |
| `/patients/new` | `NewPatientPage` | Admin, Surgeon |
| `/lists` | `SpecialtyListPage` | All approved |
| `/theatre-list` | `TheatreListPage` | All approved |
| `/audit` | `AuditLogPage` | Admin only |

---

## Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Get these from: Supabase Dashboard → Project Settings → API

---

## Supabase Auth Configuration

In Supabase Dashboard → Authentication → Settings:
- **Disable** "Enable email confirmations" for internal tool (or keep enabled if email infra available)
- **Disable** "Enable sign ups" — accounts created by Admin only via Supabase Dashboard or admin API
- Set **JWT expiry** to 86400 (24 hours) per PRD requirement

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set env vars in Vercel dashboard or:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Add `vercel.json` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
