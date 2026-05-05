/*
  # Trigger: auto-insertar fila en public.users al crear auth.user

  ## Problema que resuelve
  El flujo actual en signup/page.tsx hace supabase.auth.signUp() seguido de un
  INSERT INTO public.users manual. Esto genera una race condition: si el INSERT
  falla (error de red, sesión no establecida aún) el usuario queda en auth.users
  sin fila en public.users, rompiendo toda la lógica de roles.

  ## Solución
  Trigger AFTER INSERT en auth.users que llama a handle_new_user(), la cual inserta
  automáticamente en public.users usando el rol del raw_user_meta_data pasado durante
  el signUp.

  ## Nota para Claude Code
  Después de aplicar esta migración, eliminar el INSERT manual en:
    src/app/auth/signup/page.tsx — buscar "supabase.from('users').insert"
  El trigger lo reemplaza. El signUp debe pasar { data: { role: 'operador' | 'empresa' } }
  como tercer argumento de supabase.auth.signUp() para que el trigger lo lea.

  ## Cambios
  - Nueva función: public.handle_new_user()
  - Nuevo trigger: on_auth_user_created en auth.users
  - GRANTs de USAGE en schema public para todos los roles
*/

-- Función que se ejecuta al insertar en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'operador')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Eliminar trigger previo si existe para hacer esta migración idempotente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger AFTER INSERT en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Garantizar acceso de esquema para todos los roles estándar
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
