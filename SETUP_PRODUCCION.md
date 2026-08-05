# Setup de Producción — OperadoresFaena.cl

## 1. Supabase

1. Proyecto en [supabase.com](https://supabase.com)
2. SQL Editor → ejecutar migraciones en orden (`supabase/migrations/`)
3. **Crítico:** aplicar `20260804000000_014_harden_rls_security.sql`
4. Auth → URL Configuration:
   - Site URL: `https://operadoresfaena.cl` (o URL Vercel)
   - Redirect URLs: `https://*.vercel.app/auth/callback`, dominio prod
5. Auth → Email templates en español
6. Storage: buckets `operadores`, `empresas`, `documentos` (migraciones 007/011)
7. Realtime: habilitar para tablas `notificaciones` y `mensajes`

### Variables (cliente)

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

La **service_role** solo en server/edge; **nunca** en el cliente ni en git.

---

## 2. Vercel

1. Importar repo `datanalytics86/SitioOperadores`
2. Framework: Next.js (auto)
3. Production branch: **`main`**
4. Environment variables (Production + Preview):

| Variable | Requerida |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí |
| `NEXT_PUBLIC_USE_MOCKS` | `false` en prod |
| `UPSTASH_REDIS_REST_URL` | Opcional (rate limit) |
| `UPSTASH_REDIS_REST_TOKEN` | Opcional |
| `NEXT_PUBLIC_SENTRY_DSN` | Opcional |
| `TRANSBANK_*` | Cuando se activen pagos |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | `false` hasta go-live pagos |

5. Deploy

---

## 3. Dominio

Vercel → Domains → `operadoresfaena.cl` + DNS.

Actualizar Supabase redirect URLs y `metadataBase` si cambia el dominio canónico.

---

## 4. Seed inicial

1. Signup de cuentas demo o reales
2. Ejecutar `scripts/seed.sql` (ajusta emails si es necesario)
3. Verificar listado público sin mocks

---

## 5. Post-deploy checklist

- [ ] `/` carga vacantes reales (no banner mock)
- [ ] Signup operador → setup profile → dashboard
- [ ] Signup empresa → crear vacante → ver en `/vacantes`
- [ ] Postular → notificación empresa (Realtime)
- [ ] Middleware: operador no entra a `/dashboard/empresa`
- [ ] Password < 8 chars rechazada
- [ ] Upload CV/avatar
- [ ] `robots.txt` y `sitemap.xml`
- [ ] CI verde en GitHub Actions

---

## 6. Rollback

Ver [docs/RUNBOOK.md](./docs/RUNBOOK.md).
