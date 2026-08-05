# ARCHITECTURE.md — OperadoresFaena.cl

Documento vivo de arquitectura y decisiones técnicas.  
Última auditoría: **2026-08-04** (FASE 0 — Tier-1 Excellence).

---

## 1. Stack real (confirmado en código)

| Capa | Tecnología | Versión en repo |
|---|---|---|
| Framework | Next.js App Router | `^15.5.15` |
| UI | React + Tailwind CSS v3 | React 19, Tailwind 3.4 |
| Auth + DB + Storage | Supabase (`@supabase/ssr` + `supabase-js`) | ssr 0.6.1, js 2.49 |
| Validación | Zod | `^3.24.1` |
| Deploy | Vercel | live: sitio-operadores.vercel.app |
| Tests / CI | **Ausentes** | — |

No hay `public/`, no hay `.github/workflows`, no hay Sentry, no hay next-pwa.

---

## 2. Estado real vs documentación

### CLAUDE.md — desactualizado en varios puntos

| Claim en CLAUDE.md | Realidad en `main` @ 13fc015 |
|---|---|
| No hay `middleware.ts` | **Existe** — solo chequea sesión, **no rol** |
| `@supabase/ssr` no instalado | **Instalado**; clients en `src/lib/supabase/{client,server,middleware}.ts` |
| signup hace INSERT manual a `users` | **Ya removido**; confía en trigger 008 |
| package.json versiones inválidas | **Resuelto** (versiones reales y buildables) |
| No hay password reset | **Existe** `/auth/forgot-password` + `/auth/reset-password` + callback |
| CV/avatar inputs no renderizados | **Parcialmente listo** en dashboard operador (upload handlers + inputs) |
| `.env.local.example` no existe | **Existe** y está bien estructurado |
| PWA workbox en repo | **next-pwa eliminado**; sin `public/` |

### IMPLEMENTACION.md — parcialmente obsoleto

- Aún menciona next-pwa y estructura incompleta.
- Dice “subida de archivos lista, falta UI” — la UI de upload ya existe en operador.
- No documenta rutas legales, SEO, callback, forgot/reset, mensajes, notificaciones.

### Gaps del usuario (ago 2026) — verificados

| # | Gap | Confirmado |
|---|---|---|
| 1 | Middleware sin roles | ✅ `updateSession` solo redirige si `!user` en `/dashboard/*` |
| 2 | Landing + vacantes client-side + mock permanente | ✅ `VACANTES_MOCK` / `MOCK` como fallback si query vacía o error |
| 3 | next/image sin hostname Supabase Storage | ✅ solo `images.unsplash.com` |
| 4 | Google Fonts vía `<link>` | ✅ en `layout.tsx` head |
| 5 | Sin edición de perfil | ✅ copy “Próximamente” en ambos dashboards |
| 6 | Dashboard empresa incompleto | ✅ botones “Ver postulantes” / “Editar” sin handlers |
| 7 | Chat / notif / pagos / admin = 0 UI | ✅ schema sí, UI no |
| 8 | Cero tests + cero CI | ✅ |
| 9 | Password min 6, sin rate limit | ✅ signup/reset `minLength={6}` |
| 10 | Default branch confuso | ✅ era `claude/recruitment-website-html-QFlhh` → **corregido a `main`** |

---

## 3. Hallazgos de seguridad adicionales (FASE 0)

### CRÍTICOS

1. **Privilege escalation vía `users.role`**  
   Policy `Users can update own profile` permite UPDATE de cualquier columna incluyendo `role`. Un usuario autenticado puede auto-promoverse a `admin`.

2. **Sin policies INSERT en `operadores` y `empresas`**  
   Las migraciones 002/003 solo definen SELECT + UPDATE. El setup de perfil (`SetupProfileForm`) hace `.insert()` — **RLS debería bloquearlo** salvo que en el proyecto live se hayan añadido policies manualmente. Hay que formalizarlas en migración.

3. **Middleware sin autorización por rol**  
   Un operador autenticado puede navegar a `/dashboard/empresa` y ver el shell (el client redirige solo si no hay perfil empresa → setup-profile, o muestra empty state). Debe fallar closed en edge.

4. **Password policy débil**  
   HTML `minLength={6}` únicamente. Sin complejidad, sin Zod, sin rate limiting en auth endpoints.

### ALTOS

5. **Mock data en producción** — si la DB está vacía o falla, se muestran vacantes falsas con IDs `mock-*`. Postular a ellas rompe UX/confianza.

6. **`empresas` SELECT anon `USING (true)`** — expone todas las empresas a anon (incluyendo datos de contacto). Aceptable para un job board, pero conviene documentar y limitar columnas vía views si se endurece.

7. **Notificaciones UPDATE** — policy permite UPDATE de cualquier columna del row, no solo `leida_en`.

8. **Credenciales en `SETUP_PRODUCCION.md`** — URL de proyecto + placeholder de anon key con project id real.

### MEDIOS

9. Dual client: `src/lib/supabase.ts` exporta singleton browser usado por landing; dashboards usan `createClient()` factory. Consolidar.

10. Types incompletos: faltan `Mensaje`, `Notificacion`; dashboards usan `any`.

11. Sin `public/` (favicon, OG image, robots estático) — robots/sitemap sí existen como route handlers.

---

## 4. Mapa de datos y RLS (resumen)

```
auth.users ──trigger 008──► public.users (role)
                              ├── operadores (1:1)
                              └── empresas (1:1)
                                    └── vacantes (1:N)
                                          └── postulaciones (N) ──► operadores
                                          └── mensajes
                              notificaciones (user_id → auth.users)
                              planes / suscripciones / pagos
```

Storage buckets: `operadores`, `empresas`, `documentos` (privados a nivel bucket; policies por path).

---

## 5. Decisiones de arquitectura (Tier-1)

| Decisión | Elección | Razón |
|---|---|---|
| Auth guard | Middleware lee `public.users.role` + cookie de rol cacheada corta | Edge-fast; fallback a DB en cada request de dashboard si no hay cookie |
| Mutaciones | Server Actions + Zod | Correctness, CSRF vía Next, tipado |
| Data pública | Server Components + `revalidate` / tags | SEO, TTFB, sin flash de mock |
| Mocks | Solo `NODE_ENV===development` o `NEXT_PUBLIC_USE_MOCKS=true` | Nunca en prod |
| Pagos Chile | Transbank Webpay Plus (preferido) o Stripe | Transbank es el estándar local; Stripe como alternativa si se prioriza DX |
| Rate limit | In-memory Map en dev + interfaz lista para Upstash Redis en prod | Sin dependencia bloqueante al inicio |
| Fonts | `next/font/google` Bebas Neue + Inter | Zero layout shift, self-host |
| Images | `remotePatterns` para `*.supabase.co` storage | next/image seguro |

---

## 6. Branching y deploy

- **Default branch:** `main` (corregido 2026-08-04)
- **Trabajo:** `feature/tier1-excellence` → PR a `main`
- **Live:** Vercel production desde `main`
- **Migraciones:** aplicar en orden en Supabase SQL Editor / CLI antes de deploy de features que dependan de ellas

---

## 7. Plan de fases (estado)

| Fase | Estado | Entregable |
|---|---|---|
| 0 Auditoría + setup | ✅ | ARCHITECTURE.md + branch `feature/tier1-excellence` + default `main` |
| 1 Seguridad y correctness | ✅ | Roles middleware, password, RLS 014, fonts, images |
| 2 Arquitectura y performance | ✅ | RSC landing/vacantes, Server Actions, mocks flag |
| 3 Producto core | ✅ | Perfil edit, postulantes, notif, chat, seed |
| 4 Calidad | ✅ | CI, Playwright, Vitest, Sentry stub, docs |
| 5 Monetización + excelencia | ✅ | Planes, Transbank scaffold, admin, a11y, runbook |

---

## 8. Principios no negociables

1. Correctness → Security → Reliability → Performance → Maintainability → UX → DX  
2. Todo input de usuario validado con Zod  
3. `npm run build` verde después de cada fase  
4. Commits atómicos  
5. No romper features existentes; feature flags cuando sea necesario  
