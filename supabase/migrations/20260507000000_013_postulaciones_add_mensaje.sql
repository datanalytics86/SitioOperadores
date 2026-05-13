-- Migración 013: agregar columna `mensaje` a postulaciones.
--
-- El modal de postulación captura un comentario del operador para la empresa
-- ("Destaca tu experiencia, certificaciones o disponibilidad..."), pero la
-- tabla no tenía dónde guardarlo. Se mantiene la columna existente
-- `comentarios_empresa` para feedback de la empresa hacia el operador.
--
-- Nota: la policy de INSERT con WITH CHECK ya existe (migración 005),
-- por lo que no se requieren cambios de RLS aquí.

ALTER TABLE postulaciones
  ADD COLUMN IF NOT EXISTS mensaje text;
