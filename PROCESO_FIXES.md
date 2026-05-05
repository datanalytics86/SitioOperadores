# PROCESO_FIXES.md — Post-Bolt remediation

## Objetivo
Resolver los gaps del CLAUDE.md en 3 PRs independientes y verificables.

## Plan de PRs
- **PR A** — Build desbloqueado (gaps 1, 2 del CLAUDE.md)
- **PR B** — Auth SSR correcto (gaps 3, 4)
- **PR C** — Housekeeping (gaps 12, 13, 14)

---

## Diagnóstico inicial (pre-PR A)

### Versiones en package.json
Verificadas con `npm view <pkg> version` el 2026-05-05:

| Paquete | En package.json | En npm (latest) | Válida |
|---|---|---|---|
| typescript | ^6.0.3 | 6.0.3 | ✓ |
| @types/node | ^25.6.0 | 25.6.0 | ✓ |
| zod | ^4.4.3 | 4.4.3 | ✓ |
| next | ^15.5.15 | 16.2.4 (latest) | ✓ pinned a 15.x |
| @types/react | ^19.2.14 | actual | ✓ |

**Conclusión:** Las versiones son reales y resolvibles con npm install. El análisis previo se basó en knowledge cutoff de enero 2026 — a mayo 2026 estos paquetes ya existen.

### Error real de build (pre-PR A)
```
Error: supabaseUrl is required.
  at new cG (.next/server/chunks/542.js:...)
Export encountered an error on /auth/login/page: /auth/login
```

`src/lib/supabase.ts` llamaba `createClient(supabaseUrl, supabaseAnonKey)` a nivel de módulo. Sin `NEXT_PUBLIC_SUPABASE_URL` en el entorno de build, supabase-js lanzaba inmediatamente en prerendering.

### Paquetes fantasma detectados
- `@shadcn/ui@0.0.4` — paquete deprecated y abandonado
- `shadcn-ui@0.9.5` — CLI tool, no debe estar en runtime dependencies

### INSERT manual en signup
`src/app/auth/signup/page.tsx` hacía `supabase.from('users').insert(...)` tras `auth.signUp()`. Con el trigger `on_auth_user_created` activo (migración 008), causaba `duplicate key error` en cada registro.

---

## Decisiones técnicas

### PR A: Fix del cliente legacy para build
Fallback a URL placeholder válida (`http://localhost:54321`) en lugar de string vacío — `supabase-js` rechaza string vacío pero acepta cualquier URL con formato válido.

**¿Por qué no variables de entorno reales?** El `.env.local` no debe commitearse. Queremos que el build pase en cualquier entorno CI sin credenciales hardcodeadas.

### PR A: Versiones package.json
No se cambian versiones (son válidas). Solo se eliminan paquetes fantasma y se agregan devDependencies faltantes.

### PR B: @supabase/ssr
`createBrowserClient` no lanza durante build sin env vars (lazy init por diseño). Resuelve el problema de fondo que PR A parchó. Los clientes browser y server están separados para permitir SSR correcto.

---

## Bitácora

- [PR A] Build inicial fallaba: `supabaseUrl is required` en prerendering de `/auth/login`.
- [PR A] Versiones en package.json son válidas (npm view confirmado). Diagnóstico previo incorrecto.
- [PR A] supabase.ts: fallback `http://localhost:54321` desbloquea prerendering.
- [PR A] signup/page.tsx: quitado INSERT manual — duplicate key con trigger 008.
- [PR A] package.json: removidos @shadcn/ui y shadcn-ui; agregados eslint devDeps.
- [PR A] Build: 10 rutas, 0 errores.
- [PR B] Instalado @supabase/ssr@^0.10.2.
- [PR B] Creados src/lib/supabase/{client,server,middleware}.ts.
- [PR B] Eliminado src/lib/supabase.ts legacy.
- [PR B] 7 archivos migrados al nuevo patrón createClient().
- [PR B] middleware.ts protege /dashboard/* server-side; matcher excluye assets y PWA.
- [PR B] Build: 10 rutas, 0 errores.
