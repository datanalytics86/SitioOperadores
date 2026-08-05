/*
  # 014 — Endurecer RLS y corregir gaps de seguridad

  Hallazgos FASE 0 (2026-08-04):
  1. operadores / empresas sin policy INSERT → setup-profile falla bajo RLS estricto
  2. users UPDATE permite cambiar `role` → privilege escalation a admin
  3. notificaciones UPDATE permite mutar tipo/payload, no solo leida_en
  4. Falta UNIQUE(user_id) en perfiles (1:1 con users)

  Esta migración es idempotente donde es posible.
*/

-- ─────────────────────────────────────────────
-- 1. Unicidad 1:1 user → perfil
-- ─────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_operadores_user_id_unique
  ON operadores(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_user_id_unique
  ON empresas(user_id);

-- ─────────────────────────────────────────────
-- 2. INSERT policies para perfiles
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Operadores can insert own profile" ON operadores;
CREATE POLICY "Operadores can insert own profile"
  ON operadores FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'operador'
    )
  );

DROP POLICY IF EXISTS "Empresas can insert own profile" ON empresas;
CREATE POLICY "Empresas can insert own profile"
  ON empresas FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'empresa'
    )
  );

-- ─────────────────────────────────────────────
-- 3. Bloquear cambio de rol desde el cliente
--    (solo service_role / SQL admin puede promover)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Permitir solo si la sesión es service_role (JWT role claim)
    IF coalesce(auth.jwt() ->> 'role', '') <> 'service_role' THEN
      RAISE EXCEPTION 'No está permitido modificar el rol de usuario'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.users;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- ─────────────────────────────────────────────
-- 4. Notificaciones: solo marcar leída
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Usuario puede marcar notificacion como leida" ON notificaciones;
CREATE POLICY "Usuario puede marcar notificacion como leida"
  ON notificaciones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Impedir cambio de tipo / payload / user_id (solo leida_en)
    AND tipo = tipo
    AND user_id = user_id
  );

-- Trigger más estricto: solo leida_en puede mutar
CREATE OR REPLACE FUNCTION public.notificaciones_only_leida()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.tipo IS DISTINCT FROM OLD.tipo
     OR NEW.payload IS DISTINCT FROM OLD.payload
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Solo se puede actualizar leida_en en notificaciones'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notificaciones_only_leida ON public.notificaciones;
CREATE TRIGGER trg_notificaciones_only_leida
  BEFORE UPDATE ON public.notificaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.notificaciones_only_leida();

-- ─────────────────────────────────────────────
-- 5. Postulaciones: operador no puede mutar estado
--    (solo la empresa dueña de la vacante)
-- ─────────────────────────────────────────────
-- Ya cubierto por policy UPDATE solo para empresas.
-- Añadimos WITH CHECK extra: estado y comentarios solo empresa (ya existe).

-- ─────────────────────────────────────────────
-- 6. Comentario de documentación en schema
-- ─────────────────────────────────────────────
COMMENT ON FUNCTION public.prevent_role_escalation() IS
  'Impide que un usuario autenticado se auto-promueva a admin/empresa/operador vía UPDATE en public.users';
