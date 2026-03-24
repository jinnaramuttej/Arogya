# 🏥 AROGYA — AI SKILLS (MASTER FILE)

> **CRITICAL RULE:**
> AI must read this file IN FULL before generating or modifying ANY code in this repository.
> Violation of any rule below will produce broken, inconsistent, or hallucinated output.

---

## 1. Project Purpose

Arogya is an **emergency-first healthcare assistant** for Indian patients. It provides:
- AI-powered symptom analysis (Anthropic Claude)
- Doctor appointment booking (Supabase)
- Emergency services (SOS, ambulance numbers, hospital map)
- Multilingual support (English, Hindi, Telugu)

**It is NOT**: an admin panel, a telemedicine video call app, a pharmacy, or a feature dump.

---

## 2. Exact Tech Stack

| Layer         | Technology                     | Version   |
|---------------|--------------------------------|-----------|
| Framework     | Next.js (App Router)           | 16.2.1    |
| Language      | TypeScript                     | ^5        |
| React         | React + React DOM              | 19.2.4    |
| Styling       | Tailwind CSS                   | ^4        |
| Database/Auth | Supabase (`@supabase/ssr`)     | ^0.9.0    |
| AI            | `@anthropic-ai/sdk`            | ^0.80.0   |
| Animation     | Framer Motion                  | ^12.38.0  |
| Icons         | Lucide React                   | ^1.0.1    |
| Maps          | Leaflet                        | ^1.9.4    |
| Font          | Inter (via `next/font/google`) | —         |

### Unused but installed (legacy, do not use):
- `ai` (^3.4.33) — present but NOT used in any route
- `@ai-sdk/anthropic` (^0.0.51) — present but NOT used in any route

---

## 3. Folder Architecture (ACTUAL)

```
YY-51/
├── app/
│   ├── layout.tsx              # Root layout (Server Component)
│   ├── page.tsx                # Home page (Client Component)
│   ├── globals.css             # Global styles + Tailwind import
│   ├── favicon.ico
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # POST — Anthropic symptom analysis
│   ├── auth/
│   │   └── page.tsx            # Login / Signup
│   ├── symptom/
│   │   └── page.tsx            # Symptom form → AI analysis → results
│   ├── book/
│   │   └── page.tsx            # Doctor cards + slot booking
│   ├── emergency/
│   │   └── page.tsx            # SOS, numbers, map, first aid
│   └── dashboard/
│       └── page.tsx            # Protected — appointments & prescriptions
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Top nav, auth-aware, mobile overlay
│   │   └── Footer.tsx          # 3-column footer
│   ├── ui/
│   │   ├── GlassCard.tsx       # Reusable glassmorphism container
│   │   ├── SOSButton.tsx       # Fixed bottom-right emergency FAB
│   │   └── LanguageSwitcher.tsx# <select> for en/hi/te
│   └── features/
│       ├── EmergencyMap.tsx     # Leaflet map (client-only)
│       └── ParticleCanvas.tsx   # Canvas particle animation background
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient (for client components)
│   │   └── server.ts           # createServerClient (for server components)
│   ├── hooks/
│   │   └── useUser.ts          # Auth state hook (user + loading)
│   └── i18n/
│       ├── context.tsx          # LanguageProvider + useLanguage hook
│       └── translations.ts     # All translation keys (en, hi, te)
├── proxy.ts                     # Next.js 16 request proxy (was middleware.ts)
├── tailwind.config.ts           # Design tokens + glass plugin
├── next.config.ts               # Image remote patterns
├── package.json
├── tsconfig.json
├── .env.local                   # Secrets (gitignored)
└── .env.local.example           # Template (committed)
```

---

## 4. Component System

| Component            | Location                          | Type   | Purpose |
|----------------------|-----------------------------------|--------|---------|
| `Navbar`             | `components/layout/Navbar.tsx`    | Client | Top nav with auth-aware links, mobile menu, language switcher, logout |
| `Footer`             | `components/layout/Footer.tsx`    | Client | 3-column footer (about, quick links, contact) |
| `GlassCard`          | `components/ui/GlassCard.tsx`     | Server | Reusable glass container. Props: `children`, `className`, `noHover`, `as`, `href`, `onClick` |
| `SOSButton`          | `components/ui/SOSButton.tsx`     | Client | Fixed FAB linking to `/emergency` with pulse animation |
| `LanguageSwitcher`   | `components/ui/LanguageSwitcher.tsx` | Client | `<select>` dropdown for en/hi/te |
| `EmergencyMap`       | `components/features/EmergencyMap.tsx` | Client | Leaflet map with geolocation + hospital markers. **Must be dynamically imported with `ssr: false`** |
| `ParticleCanvas`     | `components/features/ParticleCanvas.tsx` | Client | Full-screen canvas with floating particle animation |

---

## 5. Route System

| Route        | File                        | Auth Required | Behavior |
|--------------|-----------------------------|---------------|----------|
| `/`          | `app/page.tsx`              | No            | Hero, features, counters, how-it-works, testimonials |
| `/auth`      | `app/auth/page.tsx`         | No (redirects if authed) | Email/password login/signup + Google OAuth |
| `/symptom`   | `app/symptom/page.tsx`      | No            | Structured form → Anthropic JSON → condition cards |
| `/book`      | `app/book/page.tsx`         | No (login needed to confirm) | Doctor grid, slot selection, Supabase insert |
| `/emergency` | `app/emergency/page.tsx`    | No            | SOS button, action cards, emergency numbers, Leaflet map, first aid tips |
| `/dashboard` | `app/dashboard/page.tsx`    | **Yes** (proxy redirects to `/auth`) | Appointments list from Supabase, prescriptions |
| `/api/chat`  | `app/api/chat/route.ts`     | No            | POST — accepts symptom form data, returns structured JSON from Anthropic |

---

## 6. Supabase Schema

### Table: `appointments`

| Column        | Type      | Notes |
|---------------|-----------|-------|
| `id`          | uuid (PK) | Auto-generated |
| `user_id`     | uuid (FK) | References `auth.users.id` |
| `doctor_name` | text      | From mock doctor data |
| `specialty`   | text      | e.g. "Cardiologist" |
| `date`        | text      | ISO date string |
| `time`        | text      | e.g. "10:00 AM" |
| `status`      | text      | "pending", "confirmed", "completed", "cancelled" |

**Used in:** `/book` (insert), `/dashboard` (select)

### Auth: Supabase Auth (managed)
- Email/password signup + login
- Google OAuth
- Session managed via `proxy.ts` cookie refresh

> **No other tables exist.** Doctors and prescriptions are mock data defined in page files.

---

## 7. AI Module: Symptom Checker

- **API route:** `app/api/chat/route.ts`
- **SDK:** `@anthropic-ai/sdk` (direct, NOT via Vercel AI SDK)
- **Model:** `claude-haiku-4-5-20251001`
- **Input:** `{ symptom, age, gender, duration, severity }`
- **Output:** Structured JSON with `emergency`, `conditions[]`, `immediate_warning`, `general_advice`, `disclaimer`
- **Client-side emergency keywords:** `["chest pain", "can't breathe", "unconscious", "not breathing", "heart attack", "stroke", "seizure", "severe bleeding"]`

---

## 8. UI System

### Color Palette (from `tailwind.config.ts`)
- **Navy:** `navy-950` (#001a29), `navy-800` (#003b5c)
- **Accent:** `accent` (#007aff), `accent-light` (#00b4d8), `accent-lighter` (#90e0ef)
- **Danger:** `danger` (#ef4444), `danger-light` (#f87171)
- **Success:** `success` (#10b981), `success-light` (#4ade80)
- **Warning:** `warning` (#f59e0b), `warning-light` (#fbbf24)
- **Glass:** `glass-white` (rgba 255,255,255,0.15), `glass-border` (rgba 255,255,255,0.20)

### Glassmorphism
- Applied via `.glass` Tailwind plugin utility (backdrop-blur + bg + border + shadow)
- Hover effect via `.glass-hover` utility
- Shimmer effect via `.glass-shimmer` CSS class in `globals.css`
- Use `GlassCard` component — never manually recreate glass styles

### Animation Rules
- Page entry: Framer Motion `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
- Card stagger: `staggerChildren: 0.1` or `0.12`
- SOS pulse: CSS keyframe `sos-ring` in `globals.css`
- Counter scroll-trigger: `IntersectionObserver` in `app/page.tsx`

---

## 9. Data Flow

```
User describes symptoms
        ↓
[/symptom] Form (symptom, age, gender, duration, severity)
        ↓
   Emergency keyword detection (client-side)
        ↓
[/api/chat] POST → Anthropic Claude → JSON response
        ↓
   Parse conditions, emergency flag, advice
        ↓
   Render condition cards:
     action: "home" → Monitor at home
     action: "book" → Link to /book?specialty=DoctorType
     action: "emergency" → Link to /emergency
```

---

## 10. Naming Conventions

- **Files:** PascalCase for components (`GlassCard.tsx`), camelCase for utilities (`client.ts`, `useUser.ts`)
- **Routes:** lowercase (`/symptom`, `/book`, `/auth`)
- **Components:** PascalCase (`export default function EmergencyMap()`)
- **Hooks:** camelCase prefixed with `use` (`useUser`, `useLanguage`)
- **Translation keys:** camelCase (`heroTitle`, `navEmergency`, `sosText`)
- **CSS classes:** Tailwind utilities only — no custom class names except `glass`, `glass-hover`, `glass-shimmer`, `sos-pulse`, `gradient-text`

---

## 11. Import Rules

```typescript
// ✅ Correct Supabase import (client component)
import { createClient } from "@/lib/supabase/client";

// ✅ Correct Supabase import (server component / route handler)
import { createClient } from "@/lib/supabase/server";

// ✅ Correct i18n
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

// ✅ Correct auth hook
import { useUser } from "@/lib/hooks/useUser";

// ✅ Icons from Lucide
import { Heart, AlertTriangle } from "lucide-react";

// ❌ NEVER import from these
// import { useChat } from "ai/react";       // DO NOT USE
// import { streamText } from "ai";          // DO NOT USE
// import Anthropic from "anthropic";        // Wrong package name
```

---

## 12. STRICT "DO NOT" Rules

1. **DO NOT** create new pages beyond the 6 defined routes
2. **DO NOT** use fake APIs or mock fetch calls — use Supabase or Anthropic only
3. **DO NOT** use inline styles (`style={{...}}`) — use Tailwind utilities or arbitrary values
4. **DO NOT** install or use component libraries (shadcn, MUI, Chakra, Radix)
5. **DO NOT** break the design system — all colors must come from `tailwind.config.ts`
6. **DO NOT** use `<img>` tags — use `next/image` (or Lucide icons)
7. **DO NOT** use `<video>` tags
8. **DO NOT** add `console.log` to production code
9. **DO NOT** use `any` TypeScript types
10. **DO NOT** use the Vercel AI SDK (`ai` package) — use `@anthropic-ai/sdk` directly
11. **DO NOT** create `middleware.ts` — the file is `proxy.ts` (Next.js 16 convention)
12. **DO NOT** import `createBrowserClient` in server components or `createServerClient` in client components
13. **DO NOT** hardcode hex colors outside `tailwind.config.ts` and `globals.css`
14. **DO NOT** call hooks inside async functions, callbacks, or dynamic imports
