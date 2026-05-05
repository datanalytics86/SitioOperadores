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

### Error real de build
```
Error: supabaseUrl is required.
  at new cG (.next/server/chunks/542.js:...)
Export encountered an error on /auth/login/page: /auth/login
```

`src/lib/supabase.ts` llama `createClient(supabaseUrl, supabaseAnonKey)` a nivel de módulo. Sin `NEXT_PUBLIC_SUPABASE_URL` en el entorno de build, la librería de Supabase lanza inmediatamente. Next.js no puede prerender las páginas de auth.

### Paquetes fantasma detectados
- `@shadcn/ui@0.0.4` — paquete deprecated y abandonado
- `shadcn-ui@0.9.5` — CLI tool, no debe estar en runtime dependencies

### INSERT manual en signup
En `src/app/auth/signup/page.tsx` existe:
```ts
await supabase.from('users').insert({ id: data.user.id, email, role });
```
Con el trigger `on_auth_user_created` activo (migración 008), esto causa un duplicate key error en cada signup.

---

## Decisiones técnicas

### PR A: Fix del cliente Supabase para build
**Opción elegida:** Usar fallback vacío en la inicialización del cliente para evitar el throw en build-time.

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
```

**¿Por qué no `force-dynamic`?** Requeriría tocar 8+ archivos de páginas. La causa raíz es la inicialización ansiosa en supabase.ts — mejor atacarla en la fuente. PR B refactorizará todo a `@supabase/ssr` con lazy init por diseño.

**¿Por qué no variables de entorno reales?** El `.env.local` no debe commitearse. Queremos que el build pase en cualquier entorno CI sin credenciales hardcodeadas.

### PR A: Versiones package.json
No se cambian versiones (son válidas). Solo se eliminan paquetes fantasma y se agregan devDependencies faltantes.

### PR B: @supabase/ssr
`createBrowserClient` y `createServerClient` son lazy por diseño — no lanzan en build si las vars están ausentes. Esto también resuelve el problema de fondo del PR A de forma definitiva.

---

## Bitácora

- [PR A] `npm install` OK. 575 paquetes instalados, warnings de deprecation en dependencias de `next-pwa` (esperado).
- [PR A] Build inicial falló: `supabaseUrl is required` en prerendering de `/auth/login`.
- [PR A] Diagnóstico: versiones son reales (npm view confirmado). El bloqueante real es la inicialización ansiosa de `supabase.ts`.
- [PR A] Decisión: fallback `?? ''` en supabase.ts para permitir build sin env vars. Documentado arriba.
- [PR A] Eliminado INSERT manual de signup — causa duplicate key con trigger 008.
- [PR A] Eliminados `@shadcn/ui` y `shadcn-ui` de dependencies. Agregados `eslint` y `eslint-config-next` a devDependencies.
