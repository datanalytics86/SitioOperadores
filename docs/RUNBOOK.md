# Runbook — OperadoresFaena.cl

## Stack de producción

| Servicio | Uso |
|---|---|
| Vercel | Hosting Next.js 15 |
| Supabase | Auth, Postgres RLS, Storage, Realtime |
| (opcional) Upstash | Rate limit distribuido |
| (opcional) Sentry | Errores + performance |
| Transbank | Pagos (cuando NEXT_PUBLIC_PAYMENTS_ENABLED=true) |

**Live:** https://sitio-operadores.vercel.app  
**Repo:** https://github.com/datanalytics86/SitioOperadores  
**Branch:** `main`

---

## Deploy

1. Merge a `main` → Vercel deploy automático.
2. Variables en Vercel (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Opcionales: `UPSTASH_*`, `NEXT_PUBLIC_SENTRY_DSN`, `TRANSBANK_*`, `NEXT_PUBLIC_USE_MOCKS=false`
3. Migraciones SQL: aplicar en Supabase SQL Editor **antes** del deploy que las requiera.
   - Última crítica: `014_harden_rls_security.sql`

---

## Rollback

### App (Vercel)
1. Vercel Dashboard → Deployments → deployment anterior estable → **Promote to Production**.
2. O: `git revert <sha>` + push a `main`.

### Base de datos
- Migraciones son aditivas (policies/triggers). Para revertir 014:
  ```sql
  DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.users;
  DROP TRIGGER IF EXISTS trg_notificaciones_only_leida ON public.notificaciones;
  -- re-crear policies anteriores si es necesario
  ```
- **Nunca** drop tables en prod sin backup.

### Feature flags de emergencia
| Flag | Efecto |
|---|---|
| `NEXT_PUBLIC_USE_MOCKS=false` | Sin vacantes fake en prod |
| `NEXT_PUBLIC_PAYMENTS_ENABLED=false` | Desactiva checkout |
| Quitar `UPSTASH_*` | Rate limit solo en memoria (degrada OK) |

---

## Incidentes comunes

### "No puedo postular / RLS error"
1. Verificar sesión (`auth.getUser`).
2. Verificar fila en `operadores` para el user.
3. Confirmar policies INSERT en `postulaciones` y migración 014 (INSERT perfiles).

### Operador entra a dashboard empresa
1. Confirmar middleware desplegado (cookie `of_role`).
2. Verificar `public.users.role`.
3. Limpiar cookies y re-login.

### Imágenes Storage rotas
1. `next.config.ts` remotePatterns incluye `*.supabase.co`.
2. Bucket policies 007/011.

### Auth email no llega
1. Supabase Auth → SMTP / rate limits.
2. Redirect URLs incluyen dominio Vercel + `operadoresfaena.cl`.

### Build falla en CI
1. Revisar GitHub Actions log.
2. Placeholders de env en workflow deben ser URLs válidas.
3. `npm ci` requiere lockfile sincronizado.

---

## Monitoreo

- Vercel Analytics / Speed Insights
- Supabase Dashboard → API / DB metrics
- Sentry (cuando DSN activo): errores 5xx, performance p95

## Contactos

- Owner repo: datanalytics86
- Escalación prod: Vercel + Supabase status pages
