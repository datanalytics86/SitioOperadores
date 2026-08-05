# OperadoresFaena.cl

Portal de empleo especializado en **operadores de maquinaria pesada y camiones** en Chile.

**Live:** [sitio-operadores.vercel.app](https://sitio-operadores.vercel.app)  
**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind · Supabase · Vercel

---

## Estado (agosto 2026) — Tier-1 Excellence

| Área | Estado |
|---|---|
| Auth dual + callback + reset password | ✅ |
| Middleware de roles + layouts defense-in-depth | ✅ |
| Password policy (8+ complejidad) + rate limit | ✅ |
| RLS endurecido (migración 014) | ✅ aplicar en Supabase |
| Landing / vacantes Server Components | ✅ |
| Server Actions (postular, vacantes, perfil) | ✅ |
| Edición de perfil | ✅ |
| Postulantes + cambio de estado | ✅ |
| Notificaciones Realtime | ✅ |
| Chat básico | ✅ |
| Planes + scaffold Transbank | ✅ |
| Admin dashboard | ✅ |
| CI (lint, tsc, build, Playwright) | ✅ |
| Tests Vitest | ✅ |
| Sentry stub (opcional) | ✅ |

---

## Quick start

```bash
git clone https://github.com/datanalytics86/SitioOperadores.git
cd SitioOperadores
cp .env.local.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit) |
| `npm run test:e2e` | Playwright |

---

## Arquitectura

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) y [docs/RUNBOOK.md](./docs/RUNBOOK.md).

```
src/
  app/           # App Router (RSC + Server Actions)
  components/    # UI
  lib/
    auth/        # roles, rate-limit client
    data/        # fetch server-side
    validations/ # Zod
    supabase/    # client / server / middleware
supabase/migrations/
```

---

## Seguridad

1. Aplicar migraciones en orden, especialmente **014**.
2. Nunca commitear `service_role` ni `.env.local`.
3. Default branch: **`main`**.
4. Mocks: solo dev o `NEXT_PUBLIC_USE_MOCKS=true`.

---

## Seed de datos

```bash
# 1. Crear cuentas demo vía UI signup
# 2. Ejecutar scripts/seed.sql en Supabase SQL Editor
```

---

## Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) — decisiones y auditoría
- [SETUP_PRODUCCION.md](./SETUP_PRODUCCION.md) — deploy
- [docs/RUNBOOK.md](./docs/RUNBOOK.md) — incidentes y rollback
- [docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md) — WCAG 2.2
- [CLAUDE.md](./CLAUDE.md) — guía para agentes de código
- [PROCESO_FIXES.md](./PROCESO_FIXES.md) — bitácora de fixes

---

## Licencia

UNLICENSED — código propietario OperadoresFaena.cl
