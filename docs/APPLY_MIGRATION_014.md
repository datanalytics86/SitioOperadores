# Aplicar migración 014 (obligatorio post-merge)

**Archivo:** `supabase/migrations/20260804000000_014_harden_rls_security.sql`

## Qué hace

1. UNIQUE(user_id) en `operadores` y `empresas`
2. Policies INSERT para setup de perfil
3. Trigger anti-escalación de `users.role`
4. Notificaciones: solo se puede mutar `leida_en`

## Cómo aplicar (2 min)

1. Abre [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto OperadoresFaena
2. **SQL Editor** → New query
3. Pega el contenido completo de `supabase/migrations/20260804000000_014_harden_rls_security.sql`
4. **Run**
5. Verifica sin errores

## Verificación rápida

```sql
-- Debe existir
SELECT indexname FROM pg_indexes
WHERE tablename IN ('operadores','empresas')
  AND indexname LIKE '%user_id_unique%';

-- Policies INSERT
SELECT polname, tablename FROM pg_policies
WHERE tablename IN ('operadores','empresas')
  AND cmd = 'INSERT';

-- Trigger anti-role
SELECT tgname FROM pg_trigger
WHERE tgname = 'trg_prevent_role_escalation';
```

## Realtime (notificaciones + chat)

Database → Replication / Realtime:
- Habilitar `notificaciones`
- Habilitar `mensajes`

## Vercel env (recomendado)

| Variable | Valor prod |
|---|---|
| `NEXT_PUBLIC_USE_MOCKS` | `false` |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | `false` (hasta Transbank) |

Sin acceso CLI a Vercel en esta máquina: configurar en  
Vercel → Project → Settings → Environment Variables.
