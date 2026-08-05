# CLAUDE.md

Guidance for AI coding agents working on OperadoresFaena.cl.

---

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build — run after every meaningful change
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Vitest unit tests
npm run test:e2e     # Playwright
```

**Always run `npm run build` before marking work complete.**

---

## Project

Job board for heavy machinery operators (operadores) and companies (empresas) in Chile.  
Next.js 15 App Router · Supabase (Auth + Postgres RLS + Storage + Realtime) · Tailwind · Vercel.

Live: https://sitio-operadores.vercel.app  
Default branch: **main**  
Work branch pattern: `feature/*`

---

## Architecture (current)

### Auth & roles

1. `signUp({ options: { data: { role } } })` — trigger `on_auth_user_created` inserts `public.users`.
2. **Never** manual INSERT into `public.users` after signup.
3. Middleware (`src/lib/supabase/middleware.ts`) checks session **and** role from `public.users` (cookie `of_role`).
4. Layouts under `/dashboard/operador`, `/dashboard/empresa`, `/dashboard/admin` re-check role server-side.
5. Password: Zod min 8 + upper + lower + digit (`src/lib/validations/auth.ts`).
6. Rate limit: `/api/auth/rate-limit` + Upstash-ready (`src/lib/rate-limit.ts`).

### Data fetching

- Public listings: **Server Components** + `getVacantes()` in `src/lib/data/vacantes.ts`, `revalidate = 60`.
- Mocks only if `NODE_ENV===development` or `NEXT_PUBLIC_USE_MOCKS=true`.
- Mutations: **Server Actions** in `src/app/actions/*` with Zod.

### Key routes

| Route | Auth | Notes |
|---|---|---|
| `/` | Public | RSC landing |
| `/vacantes` | Public | RSC + URL filters |
| `/auth/*` | Public | login, signup, forgot, reset, callback, setup-profile |
| `/dashboard/operador` | operador | perfil, CV, postulaciones, mensajes |
| `/dashboard/empresa` | empresa | vacantes, postulantes, mensajes |
| `/dashboard/admin` | admin | KPIs |
| `/planes` | Public | pricing + Transbank scaffold |

### Tables

`users`, `operadores`, `empresas`, `vacantes`, `postulaciones`, `mensajes`, `notificaciones`, `planes_suscripcion`, `suscripciones_empresa`, `pagos`.

RLS on all. Migration **014** adds INSERT profiles, role-escalation trigger, notif update guard.

### Styling

- Colors: `faena` (#FF6200), `ink` (900–500), `chile`
- Fonts: `next/font` — Bebas Neue (`font-display`) + Inter (`font-sans`)
- Utilities: `.btn-primary`, `.btn-secondary`, `.card`, `.section-label`

---

## Hard rules

1. Correctness → Security → Reliability → Performance → Maintainability → UX → DX
2. Zod on all user inputs
3. `.maybeSingle()` not `.single()` for 0–1 rows
4. Never `USING (true)` on write policies
5. Atomic commits, clear messages
6. Do not break existing flows; use feature flags
7. Document decisions in `ARCHITECTURE.md` / `PROCESO_FIXES.md`

---

## Gaps intentionally deferred / scaffolded

- Full Transbank checkout (endpoint scaffolded, flag off)
- Full Sentry SDK (stub in `src/lib/sentry.ts` — run wizard when ready)
- Advanced admin moderation tools
- Multi-user empresa seats

See `ARCHITECTURE.md` for full audit history (FASE 0–5).
