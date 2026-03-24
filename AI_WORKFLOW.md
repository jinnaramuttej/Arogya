# 🔄 AROGYA — AI WORKFLOW

> Every code generation or modification task MUST follow this exact workflow.

---

## Step 1: Read AI_SKILLS.md

Before writing a single line of code:
- Read `AI_SKILLS.md` completely
- Identify which route / component / module is being modified
- Confirm the change does not violate any "DO NOT" rule

---

## Step 2: Analyze the Target File

- Read the full contents of the target file
- Understand its current imports, state, props, and data flow
- Identify whether it is a Server Component or Client Component (`"use client"`)
- Check if it uses Supabase, i18n, or auth hooks

---

## Step 3: Check Related Components

- If modifying a page, check which components it imports
- If modifying a component, check which pages use it
- Cross-reference with `ARCHITECTURE.md` component hierarchy
- **Never duplicate logic** that already exists in a shared component or hook

---

## Step 4: Verify Database Usage

- Check `DATABASE_GUIDE.md` for table schema
- **Never reference tables that don't exist** (only `appointments` exists)
- Always destructure `{ data, error }` from Supabase queries
- Use `createClient` from `@/lib/supabase/client` in client components
- Use `createClient` from `@/lib/supabase/server` in server components / route handlers

---

## Step 5: Generate Code

Follow these rules strictly:

| Rule | Enforcement |
|------|-------------|
| TypeScript only | No `.js` or `.jsx` files |
| No `any` types | Use proper interfaces |
| Tailwind only | No inline styles |
| Lucide icons only | No Font Awesome, no Hero Icons |
| `next/image` only | No `<img>` tags |
| Framer Motion | For page/card animations only |
| Error handling | All async calls must have try/catch or `.catch()` |
| Translation keys | Use `t(key, lang)` — never hardcode user-facing text without first checking translations |

---

## Step 6: Validate Against Rules

Before returning code, verify:

- [ ] No new pages created beyond the 6 defined routes
- [ ] No hallucinated Supabase tables referenced
- [ ] No unused imports remain
- [ ] No inline styles used
- [ ] No `console.log` statements
- [ ] No `any` types
- [ ] `"use client"` is present if hooks are used
- [ ] `"use client"` is NOT present if the component is server-only
- [ ] Supabase client type matches component type (browser vs server)
- [ ] All colors reference `tailwind.config.ts` tokens
- [ ] GlassCard is used for card containers (not manual glass CSS)
- [ ] Dynamic imports use `ssr: false` for browser-only libraries (Leaflet)

---

## Hard Rules

1. **No duplicate logic** — if a hook, utility, or component exists, use it
2. **No hallucinated tables** — only `appointments` exists in Supabase
3. **No unused imports** — remove any import not referenced in the file
4. **No broken architecture** — every file must follow the folder structure in `AI_SKILLS.md`
5. **No Vercel AI SDK** — use `@anthropic-ai/sdk` directly for AI features
6. **No middleware.ts** — the file is `proxy.ts` (Next.js 16)
