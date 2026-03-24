# 📦 AROGYA — MODULE RULES

> Rules for every module. AI must follow these when modifying any module.

---

## Module: Home (`/`)

**Purpose:** Landing page — first impression, feature showcase, social proof.

**Allowed Logic:**
- IntersectionObserver for counter animation
- Framer Motion stagger for card reveal
- Translation lookups via `t(key, lang)`

**UI Rules:**
- Hero section with gradient CTAs
- GlassCard for features and testimonials
- Counter component with scroll-trigger animation
- 3-column grid on desktop, single column on mobile

**Data Sources:** None (all static/translated content)

### DO
- Use GlassCard for all card containers
- Use Framer Motion `variants` for staggered entrance
- Link CTAs to `/symptom` and `/book`

### DON'T
- Don't fetch data from Supabase on this page
- Don't add more than 3 feature cards
- Don't add carousels, modals, or popups

---

## Module: Symptom (`/symptom`)

**Purpose:** Structured symptom input → AI analysis → actionable condition cards.

**Allowed Logic:**
- Form state management (symptom, age, gender, duration, severity)
- Client-side emergency keyword detection (before API call)
- `fetch("/api/chat")` POST → parse JSON response
- Conditional rendering: form → loading → results

**UI Rules:**
- Form inside a single GlassCard
- Loading state with spinner + emergency banner (if keywords detected)
- Condition cards with probability badges (red/amber/green)
- Action buttons: "Monitor at home" / "Book a [specialty]" / "Go to Emergency"
- General advice in teal card, disclaimer in muted card
- Framer Motion stagger (0.1s per condition card)

**Data Sources:**
- `POST /api/chat` → Anthropic Claude (structured JSON)
- Client-side emergency keyword list (hardcoded array)

### DO
- Always show disclaimer card
- Link "Book" buttons to `/book?specialty=DoctorType`
- Show emergency banner instantly for keyword matches (don't wait for API)

### DON'T
- Don't use `useChat` or the Vercel AI SDK
- Don't stream responses (JSON must be complete before rendering)
- Don't allow free-form chat (use structured form only)

---

## Module: Emergency (`/emergency`)

**Purpose:** Immediate access to life-saving resources.

**Allowed Logic:**
- SOS button triggers `window.open("tel:108")`
- Geolocation for map centering
- `navigator.share` for location sharing
- Dynamic Leaflet import with `ssr: false`

**UI Rules:**
- SOS button with `sos-pulse` animation (CSS keyframe)
- 4 action cards (Call Ambulance, Find Hospital, Share Location, Emergency Contact)
- 4 emergency number cards (108, 100, 101, 1091)
- Leaflet map in GlassCard with rounded corners
- 3 first-aid tip cards (Heart Attack, Choking, Fever)

**Data Sources:**
- Static emergency contacts (hardcoded)
- Geolocation API (browser)
- OpenStreetMap tiles (Leaflet)

### DO
- Always show emergency numbers without requiring auth
- Use `dynamic(() => import(...), { ssr: false })` for EmergencyMap
- Show fallback content while map loads

### DON'T
- Don't require auth for any emergency feature
- Don't import Leaflet at the top level (breaks SSR)
- Don't remove or change emergency numbers

---

## Module: Book (`/book`)

**Purpose:** Browse doctors, select time slots, confirm appointments.

**Allowed Logic:**
- Read `?specialty=` from URL params (auto-select matching doctor)
- Doctor selection → slot selection → confirm booking
- Supabase INSERT into `appointments` table
- Auth check before allowing confirmation

**UI Rules:**
- Doctor cards in responsive grid (GlassCard with hover)
- Star rating display with yellow Star icon
- Slot buttons with selected state highlight
- Success state: green CheckCircle icon + confirmation message
- Error state: red banner with error message

**Data Sources:**
- Mock doctors array (4 doctors, hardcoded in page)
- Supabase `appointments` table (INSERT)
- URL search params (`?specialty=`)

### DO
- Wrap the page in `<Suspense>` (required by `useSearchParams`)
- Show "Please login" error if user tries to book without auth
- Reset state after successful booking

### DON'T
- Don't allow booking without selecting both doctor AND slot
- Don't create a `doctors` table (mock data is intentional for MVP)

---

## Module: Dashboard (`/dashboard`)

**Purpose:** View user's appointments and prescriptions (protected route).

**Allowed Logic:**
- `useEffect` to fetch appointments from Supabase on mount
- Tab switching between "Appointments" and "Prescriptions"
- Loading and error states

**UI Rules:**
- Two tab buttons (appointments / prescriptions)
- Appointment cards with status badges (color-coded)
- Empty state with icon and "Book Now" CTA
- Prescription cards with medication details
- User email displayed in header

**Data Sources:**
- Supabase `appointments` table (SELECT)
- Mock prescriptions array (hardcoded)

### DO
- Show loading spinner while fetching
- Display user email from `useUser()` hook
- Link "Book Now" to `/book`

### DON'T
- Don't allow access without auth (proxy.ts handles redirect)
- Don't create a `prescriptions` table (mock data is intentional)
- Don't add edit/delete functionality to appointments

---

## Module: Auth (`/auth`)

**Purpose:** User authentication (login, signup, Google OAuth).

**Allowed Logic:**
- Email/password login via `signInWithPassword`
- Email/password signup via `signUp` with `data: { name }`
- Google OAuth via `signInWithOAuth`
- Password confirmation check on signup
- Redirect to `/dashboard` on success

**UI Rules:**
- Single GlassCard centered vertically
- Toggle between Login and Signup forms
- Input fields with Lucide icon prefixes (Mail, Lock, User)
- Google button with inline SVG logo
- Error banner for auth failures
- "Back to home" link at bottom

**Data Sources:**
- Supabase Auth (managed)

### DO
- Validate passwords match before signup
- Show loading state on submit button
- Clear errors when toggling between login/signup

### DON'T
- Don't add forgot password flow (not implemented)
- Don't add additional OAuth providers
- Don't store user profile data in custom tables
