# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Production build — run this after every change to verify no TypeScript errors
npm run lint     # ESLint
npm run start    # Start production server
```

There are no tests. `npm run build` is the primary verification step — always run it before marking a task complete.

## Project: OperadoresFaena.cl

Job board connecting heavy machinery operators (operadores) with mining/construction companies (empresas) in Chile. Next.js 15 App Router, Bolt Database (auth + DB + storage), Tailwind CSS.

## Architecture

### Auth & Role System

Two user roles: `operador` and `empresa`. The signup flow works as follows:

1. `supabase.auth.signUp()` — must pass `{ data: { role: 'operador' | 'empresa' } }` as options so the DB trigger reads it
2. A Postgres trigger `on_auth_user_created` on `auth.users` automatically inserts a row in `public.users` with the role from `raw_user_meta_data`
3. User is redirected to `/auth/setup-profile?role=<role>` to create their profile in `operadores` or `empresas`

**PENDING CODE FIX:** `src/app/auth/signup/page.tsx` still does a manual `supabase.from('users').insert(...)` after signUp. This is now redundant (and will cause a duplicate key error) since the trigger handles it. That manual INSERT must be removed.

Login detects role from `public.users` and redirects to the appropriate dashboard. Navbar reads role to show/hide links.

Auth state is checked with `supabase.auth.getUser()` inside `useEffect`. The `onAuthStateChange` callback must never be async directly — wrap async code in an IIFE: `(() => { ... })()`.

### Database & RLS

All tables have Row Level Security enabled. Key constraint: never use `USING (true)` in policies. Apply migrations with `mcp__supabase__apply_migration`.

| Table | Purpose |
|---|---|
| `users` | Auth bridge — maps `auth.uid()` to role |
| `operadores` | Worker profiles (equipment, experience, region, CV) |
| `empresas` | Company profiles (name, RUT, region) |
| `vacantes` | Job listings owned by an empresa |
| `postulaciones` | Applications linking operador → vacante; unique per pair |
| `mensajes` | Async chat between empresa and operador per vacante |
| `notificaciones` | In-app notification inbox per user |
| `planes_suscripcion` | Subscription tiers (seeded: Starter/Pro/Enterprise) |
| `suscripciones_empresa` | Company subscriptions |
| `pagos` | Payment records |

Always use `.maybeSingle()` (not `.single()`) when expecting zero or one row.

Foreign key pattern for joined queries: `select('*, empresa:empresas(nombre, logo_url)')`.

Key RLS rules:
- `vacantes`: `Anyone can read active vacantes` policy allows `anon` role to SELECT where `activa = true` — required for the public landing page
- `postulaciones`: INSERT allowed for authenticated; WITH CHECK not set on insert (relies on FK constraints for ownership)
- `notificaciones`: INSERT is blocked for all authenticated users — only `service_role` can insert (via triggers or edge functions)
- `mensajes`: INSERT WITH CHECK verifies the emitting user matches the `emisor` field via FK to `operadores`/`empresas`

### Storage

Three Bolt Database buckets (all `public: false` at bucket level; access controlled entirely via RLS policies):

| Bucket | Purpose | Public SELECT |
|---|---|---|
| `operadores` | Avatar photos, CV PDFs | anon can read `avatar/` subfolder |
| `empresas` | Company logos | anon can read `logo/` subfolder |
| `documentos` | Sensitive docs (licencias, certificaciones) | Owner only |

Path convention: `{user_id}/{file_type}/{timestamp}_{filename}`

After upload, get the public URL via `supabase.storage.from(bucket).getPublicUrl(path)`.

### Mock Data Fallback

Landing page (`src/app/page.tsx`) and `/vacantes` (`src/app/vacantes/page.tsx`) both contain a `MOCK` / `VACANTES_MOCK` array. When the Bolt Database query returns empty results, the UI falls back to mock data so the page always looks populated.

**Do not remove mock data until real data in production is verified.** The fallback is intentional.

### URL Search Params

The `Hero` component passes `?q=<query>` to `/vacantes`. The vacantes page reads it with `useSearchParams()` inside a Suspense boundary to initialize the search field. Whenever `useSearchParams()` is used, wrap the component in `<Suspense>`.

### Styling Conventions

Custom Tailwind tokens (defined in `tailwind.config.js`):
- **Colors:** `faena` (orange, `#FF6200`, shades 50–900), `ink` (dark neutrals: 900=`#0A0A0A`, 800=`#111111`, 700=`#1F1F1F`, 600=`#2A2A2A`, 500=`#3A3A3A`), `chile` (`#0033A0`)
- **Fonts:** `font-display` = Bebas Neue (headings), `font-sans` = Inter (body)
- **Shadows:** `shadow-glow-faena`, `shadow-card`, `shadow-card-hover`

Component utility classes defined in `src/app/globals.css`:

| Class | Usage |
|---|---|
| `.btn-primary` | Orange fill button (black text) |
| `.btn-secondary` | Dark fill button with border |
| `.btn-ghost` | Text-only button |
| `.card` | Dark card with border and hover highlight |
| `.section-label` | Small uppercase orange label above section titles |
| `.chip-active` / `.chip-inactive` | Tag/filter pill states |

Background is always `bg-ink-800`. Cards are `bg-ink-700`. Never use purple/indigo hues.

### Route Map

| Route | Auth | Description |
|---|---|---|
| `/` | No | Landing — hero, job listings, how it works, testimonials, CTA |
| `/vacantes` | No | Full job board with sidebar filters and pagination |
| `/vacantes/[id]` | No | Job detail + apply button |
| `/auth/login` | No | Email/password login |
| `/auth/signup?role=` | No | Registration with role toggle |
| `/auth/setup-profile?role=` | Yes | Profile creation after signup |
| `/dashboard/operador` | Operador | Profile, skills, CV upload, applications (Perfil / Postulaciones tabs) |
| `/dashboard/empresa` | Empresa | KPIs, vacantes, postulantes, company data (3 tabs) |
| `/dashboard/empresa/nueva-vacante` | Empresa | Create job listing form |

### Key Components

- **Navbar** — Fixed, transparent on landing / opaque on scroll. Role-aware links. Handles sign-out.
- **Hero** — Rotating equipment words animation, search bar → redirects to `/vacantes?q=`, equipment quick-filter chips.
- **PostulacionModal** — Detects auth state: logged-in operadors get 1-click apply (reads profile from `operadores` table); unauthenticated users see signup prompt.
- **SetupProfileForm** — Shared component used by `/auth/setup-profile` for both roles.
- **StatsSection** — Count-up animation triggered by `IntersectionObserver`.

## What Is Not Yet Built (Gaps for Claude Code)

### Critical — must fix before production

1. **`signup/page.tsx` manual INSERT** — Remove `supabase.from('users').insert(...)` in `src/app/auth/signup/page.tsx`. The trigger `on_auth_user_created` now handles this automatically. Keeping the manual insert will cause a duplicate key error.

2. **`package.json` invalid versions** — `typescript: "^6.0.3"`, `@types/node: "^25"`, `zod: "^4.4.3"` do not exist on npm. Build will fail on Vercel. Must be pinned to real versions (typescript ~5.x, @types/node ~20.x, zod ~3.x).

3. **No `middleware.ts`** — `/dashboard/*` routes are not protected server-side. Any unauthenticated user can hit those URLs and see a flash before the client-side redirect fires. Add `middleware.ts` with `@supabase/ssr` to guard dashboard routes.

4. **`@supabase/ssr` not installed** — The project uses `@supabase/supabase-js` client-side only. For proper SSR auth (middleware, server components) `@supabase/ssr` is required. Current client in `src/lib/supabase.ts` is browser-only.

### Features with schema ready, no UI

5. **Chat (`mensajes` table)** — Table exists with full RLS. No UI in either dashboard. Entry point: a "Mensajes" tab in both `/dashboard/operador` and `/dashboard/empresa`.

6. **Notifications (`notificaciones` table)** — Table exists. No badge UI, no trigger that inserts notifications on `postulacion` events, no Bolt Database Realtime subscription.

7. **CV/Avatar upload UI** — `handleUploadCv` and `handleUploadAvatar` functions exist in `src/app/dashboard/operador/page.tsx` with `fileInputCv`/`fileInputAvatar` refs, but the file `<input>` elements are not rendered in the JSX. Storage and logic are ready.

8. **Stripe/Transbank payments** — `planes_suscripcion`, `suscripciones_empresa`, `pagos` tables exist with full schema. No UI, no Stripe edge function, no webhook handler.

9. **Admin dashboard** — `users.role` supports `'admin'` but `/dashboard/admin` route does not exist.

10. **Password reset flow** — No `/auth/reset-password` route. Bolt Database Auth supports it but it is not wired.

11. **Real-time postulaciones** — `PostulacionModal` and dashboards do not subscribe to Bolt Database Realtime. Empresa dashboard does not update when new applications arrive without page refresh.

### Housekeeping

12. **`public/sw.js` and `public/workbox-*.js`** — Generated PWA files should be in `.gitignore`, not committed. They will be regenerated at build time by `next-pwa`.

13. **`SETUP_PRODUCCION.md`** — Contains Bolt Database credentials (URL + anon key) in plain text. While the anon key is safe to expose, the file pattern is risky. At minimum add a note that `service_role` keys must never go there.

14. **`.env.local.example`** — Does not exist. Add it so new developers know which vars are required.

## Services Configuration Pending (requires Bolt Database Dashboard / Vercel UI)

These cannot be done via migrations or code — they require manual action in external dashboards:

### Bolt Database Authentication → Email Templates

Set language to Spanish and brand to OperadoresFaena.cl for:
- **Confirm signup** — Subject: `"Confirma tu cuenta en OperadoresFaena.cl"`
- **Reset password** — Subject: `"Restablece tu contraseña en OperadoresFaena.cl"`

### Bolt Database Authentication → URL Configuration

- Site URL: set to production Vercel URL once deployed
- Redirect URLs: add `https://*.vercel.app/auth/callback` and production domain

### Vercel

- Connect repo `github.com/datanalytics86/SitioOperadores`
- Framework preset: Next.js (auto-detect)
- Environment variables (Production + Preview):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Note: first build will fail due to invalid package versions (item 2 above)
