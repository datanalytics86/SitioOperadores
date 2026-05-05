/*
  # Tabla: notificaciones

  ## Propósito
  Centro de notificaciones in-app para ambos tipos de usuario. Se inserta una fila
  por evento relevante (nueva postulación, cambio de estado, mensaje nuevo, sistema).
  La UI puede mostrar un badge con el conteo de no leídas.

  ## Tipos de notificación (campo `tipo`)
  - postulacion_nueva: empresa recibe nueva postulación
  - postulacion_estado: operador es notificado de cambio de estado (aceptado/rechazado)
  - mensaje: nuevo mensaje en el chat
  - sistema: avisos generales de la plataforma

  ## Campo `payload` (jsonb)
  Estructura libre según tipo, ejemplos:
    postulacion_nueva:  { vacante_id, vacante_titulo, operador_nombre }
    postulacion_estado: { vacante_id, vacante_titulo, estado_nuevo }
    mensaje:            { mensaje_id, vacante_id, emisor_nombre }
    sistema:            { titulo, cuerpo, url_accion }

  ## Seguridad (RLS)
  - SELECT: solo el dueño (user_id = auth.uid())
  - INSERT: solo service_role (el trigger/edge function lo inserta)
  - UPDATE: solo el dueño, únicamente para marcar leida_en
  - DELETE: no permitido

  ## Nota para Claude Code
  La UI de notificaciones no está implementada. Puntos de inserción sugeridos:
  - Edge function o trigger DB que crea la notificación al insertar en postulaciones
  - Edge function o trigger al actualizar postulaciones.estado
  - Bolt Database Realtime para actualizaciones en tiempo real del badge
*/

CREATE TABLE IF NOT EXISTS notificaciones (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo       text        NOT NULL CHECK (tipo IN ('postulacion_nueva', 'postulacion_estado', 'mensaje', 'sistema')),
  payload    jsonb       NOT NULL DEFAULT '{}',
  leida_en   timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para inbox y conteo de no leídas
CREATE INDEX IF NOT EXISTS idx_notificaciones_user    ON notificaciones(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_no_leida ON notificaciones(user_id) WHERE leida_en IS NULL;

ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- El dueño puede leer sus notificaciones
CREATE POLICY "Usuario puede leer sus notificaciones"
  ON notificaciones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Solo service_role puede insertar (triggers, edge functions)
-- No se crea policy de INSERT para authenticated: se bloquea por defecto

-- El dueño puede marcar como leída
CREATE POLICY "Usuario puede marcar notificacion como leida"
  ON notificaciones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND leida_en IS NOT NULL);
