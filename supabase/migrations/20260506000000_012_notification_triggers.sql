-- Migración 012: trigger que crea una notificación para la empresa
-- cada vez que un operador crea una postulación.
--
-- Schema relevante (de migración 010):
--   notificaciones.tipo CHECK (tipo IN
--     ('postulacion_nueva', 'postulacion_estado', 'mensaje', 'sistema'))
--   notificaciones.payload jsonb NOT NULL
--
-- El RLS de notificaciones bloquea INSERT a authenticated; este trigger
-- usa SECURITY DEFINER para insertar bajo permisos del owner de la función.

CREATE OR REPLACE FUNCTION public.notify_empresa_on_postulacion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  empresa_user_id uuid;
  vacante_titulo  text;
BEGIN
  SELECT v.titulo, e.user_id
    INTO vacante_titulo, empresa_user_id
  FROM public.vacantes v
  JOIN public.empresas e ON e.id = v.empresa_id
  WHERE v.id = NEW.vacante_id;

  IF empresa_user_id IS NOT NULL THEN
    INSERT INTO public.notificaciones (user_id, tipo, payload)
    VALUES (
      empresa_user_id,
      'postulacion_nueva',
      jsonb_build_object(
        'titulo',     'Nueva postulación recibida',
        'mensaje',    'Tienes una nueva postulación para: ' || COALESCE(vacante_titulo, 'sin título'),
        'vacante_id', NEW.vacante_id,
        'postulacion_id', NEW.id,
        'link',       '/dashboard/empresa?tab=postulaciones&vacante=' || NEW.vacante_id::text
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_postulacion_created ON public.postulaciones;

CREATE TRIGGER on_postulacion_created
AFTER INSERT ON public.postulaciones
FOR EACH ROW EXECUTE FUNCTION public.notify_empresa_on_postulacion();
