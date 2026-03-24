# 🗄️ AROGYA — DATABASE GUIDE

> **Only document what ACTUALLY exists.** No invented tables.

---

## Authentication: Supabase Auth (Managed)

Supabase manages the `auth.users` table automatically. It is not directly queried.

### Auth Methods Available
- Email/password signup + login
- Google OAuth (via `signInWithOAuth`)

### Session Management
- `proxy.ts` refreshes Supabase session cookies on every request
- `lib/hooks/useUser.ts` subscribes to auth state changes on the client

### Where Used
| File | Usage |
|------|-------|
| `proxy.ts` | `supabase.auth.getUser()` — route protection |
| `lib/hooks/useUser.ts` | `supabase.auth.getUser()` + `onAuthStateChange()` |
| `app/auth/page.tsx` | `signInWithPassword()`, `signUp()`, `signInWithOAuth()` |
| `components/layout/Navbar.tsx` | `signOut()` |

---

## Table: `appointments`

This is the **only custom table** in the database.

### Schema

| Column        | Type   | Nullable | Default         | Description |
|---------------|--------|----------|-----------------|-------------|
| `id`          | uuid   | No       | `gen_random_uuid()` | Primary key |
| `user_id`     | uuid   | No       | —               | FK → `auth.users.id` |
| `doctor_name` | text   | No       | —               | e.g. "Dr. Priya Sharma" |
| `specialty`   | text   | No       | —               | e.g. "Cardiologist" |
| `date`        | text   | No       | —               | ISO date e.g. "2025-03-24" |
| `time`        | text   | No       | —               | e.g. "10:00 AM" |
| `status`      | text   | No       | —               | "pending" / "confirmed" / "completed" / "cancelled" |

### Relationships
- `user_id` → `auth.users.id` (each user sees only their own appointments)

### Where Used

| File | Operation | Query Pattern |
|------|-----------|---------------|
| `app/book/page.tsx` | **INSERT** | `supabase.from("appointments").insert([{...}])` |
| `app/dashboard/page.tsx` | **SELECT** | `supabase.from("appointments").select("*").eq("user_id", user.id).order("date", { ascending: false })` |

### Query Patterns

**Insert (booking):**
```typescript
const { data: _data, error: insertError } = await supabase
  .from("appointments")
  .insert([{
    user_id: user.id,
    doctor_name: doc.name,
    specialty: doc.specialty,
    date: new Date().toISOString().split("T")[0],
    time: selectedSlot,
    status: "pending",
  }]);
```

**Select (dashboard):**
```typescript
const { data, error: fetchError } = await supabase
  .from("appointments")
  .select("*")
  .eq("user_id", user.id)
  .order("date", { ascending: false });
```

---

## Tables That Do NOT Exist

The following are **NOT real tables** — they are mock data defined in page files:

| Concept | Where Mocked | Notes |
|---------|-------------|-------|
| Doctors | `app/book/page.tsx` (line 13-42) | Array of 4 mock doctors with slots |
| Prescriptions | `app/dashboard/page.tsx` (line 23-26) | Array of 2 mock prescriptions |
| Emergency contacts | `app/emergency/page.tsx` (line 23-28) | Static array (108/100/101/1091) |
| Hospitals | `components/features/EmergencyMap.tsx` | Mock markers near user location |

> **AI MUST NOT** reference `doctors`, `prescriptions`, `emergency_contacts`, or `hospitals` tables in Supabase queries — they don't exist.

---

## Environment Variables

| Variable | Where Used | Client-Side |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `proxy.ts` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `proxy.ts` | Yes |
| `ANTHROPIC_API_KEY` | `app/api/chat/route.ts` | No (server only) |
