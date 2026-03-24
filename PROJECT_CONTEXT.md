# 🎯 AROGYA — PROJECT CONTEXT

---

## Product Vision

Arogya is a **mobile-first healthcare companion** designed for Indian patients. It bridges the gap between "I feel sick" and "I'm getting help" using AI-powered symptom analysis, instant doctor booking, and one-tap emergency access.

The core philosophy: **calm, fast, minimal.**

Every interaction should feel reassuring, never overwhelming. The UI uses dark glassmorphism aesthetics to create a calm, premium feel — critical for users in medical distress.

---

## Target Users

- **Primary:** Indian patients (ages 18-65) accessing healthcare from mobile devices
- **Secondary:** Caregivers helping family members navigate symptoms
- **Context:** Users may be anxious, in pain, or in emergency situations
- **Language:** English, Hindi (हिंदी), Telugu (తెలుగు)

### Device Assumptions
- Mobile-first (375px minimum width)
- Touch-friendly targets (minimum 44px tap areas)
- Potentially slow connections (graceful loading states required)

---

## Core Flows

### Flow 1: Symptom → Decision
```
User feels unwell
    → Opens /symptom
    → Fills structured form (symptom, age, gender, duration, severity)
    → AI analyzes and returns conditions with action recommendations
    → User either:
        a) Monitors at home (low risk)
        b) Books a specialist → /book?specialty=DoctorType
        c) Goes to emergency → /emergency
```

### Flow 2: Emergency → Ambulance
```
User or caregiver recognizes emergency
    → Presses SOS button (visible on every page)
    → Lands on /emergency
    → Can immediately:
        a) Call 108 (ambulance)
        b) Find nearest hospital on map
        c) Share live GPS location
        d) View first-aid tips
```

### Flow 3: Book → Appointment
```
User decides to see a doctor
    → Opens /book (possibly with ?specialty= pre-filter)
    → Selects doctor → selects time slot
    → Confirms booking (requires login)
    → Appointment saved to Supabase
    → Visible in /dashboard
```

---

## UX Philosophy

1. **Calm:** Dark navy backgrounds, soft glassmorphism, no harsh colors except danger-red for emergencies
2. **Fast:** Every critical action (SOS, call ambulance, book doctor) is reachable in ≤2 taps
3. **Minimal:** No information overload. Condition cards show only: name, probability, doctor type, action
4. **Accessible:** Emergency features work without login. Language support for non-English speakers
5. **Trustworthy:** Every AI response includes a medical disclaimer. Probability badges are conservative ("when in doubt, mark higher risk")

---

## What the App IS

- An AI-powered symptom checker that provides preliminary guidance
- A doctor booking system for scheduled appointments
- An emergency services hub with ambulance numbers and hospital maps
- A multilingual healthcare assistant for Indian users

---

## What the App is NOT

- ❌ **Not a telemedicine platform** — no video calls, no live doctor chat
- ❌ **Not an admin system** — no doctor/hospital management panels
- ❌ **Not a pharmacy** — no medication ordering or delivery
- ❌ **Not an EHR** — no medical record storage beyond appointments
- ❌ **Not a feature dump** — exactly 6 routes, no more
- ❌ **Not a social platform** — no reviews, ratings, or community features

---

## Common AI Mistakes to Prevent

### 1. Wrong Supabase Client Usage
```typescript
// ❌ WRONG: using server client in a "use client" component
import { createClient } from "@/lib/supabase/server";

// ✅ CORRECT: using browser client in a "use client" component
import { createClient } from "@/lib/supabase/client";
```

### 2. Unnecessary `"use client"`
```typescript
// ❌ WRONG: adding "use client" to a server component like GlassCard
"use client";
export default function GlassCard() { ... }

// ✅ CORRECT: GlassCard has no hooks, it's a server component
export default function GlassCard() { ... }
```

### 3. Adding Extra Pages
```typescript
// ❌ WRONG: creating /app/profile/page.tsx or /app/about/page.tsx
// These routes don't exist in the architecture

// ✅ CORRECT: only these routes exist:
// /, /auth, /symptom, /book, /emergency, /dashboard, /api/chat
```

### 4. Breaking the UI Design System
```typescript
// ❌ WRONG: using arbitrary colors
<div className="bg-blue-500 text-gray-200">

// ✅ CORRECT: using design tokens
<div className="bg-accent text-white/80">
```

### 5. Using Inline Styles
```typescript
// ❌ WRONG
<div style={{ marginTop: 20, backgroundColor: "blue" }}>

// ✅ CORRECT
<div className="mt-5 bg-accent">
```

### 6. Ignoring Error Handling
```typescript
// ❌ WRONG: no error handling
const { data } = await supabase.from("appointments").select("*");

// ✅ CORRECT: destructure and handle error
const { data, error } = await supabase.from("appointments").select("*");
if (error) {
  setError(error.message);
  return;
}
```

### 7. Using Hooks Inside Async Functions
```typescript
// ❌ WRONG: calling useEffect inside a dynamic import
import("react").then((React) => {
  React.useEffect(() => { ... }, []);
});

// ✅ CORRECT: import and call hooks at the top level
import { useEffect } from "react";
useEffect(() => { ... }, []);
```

### 8. Creating middleware.ts
```typescript
// ❌ WRONG: Next.js 16 deprecated middleware.ts
export function middleware() { ... }

// ✅ CORRECT: use proxy.ts with exported proxy function
export function proxy() { ... }
```
