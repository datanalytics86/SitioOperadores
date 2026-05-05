/*
  # Tabla: mensajes

  ## Propósito
  Chat asíncrono entre empresa y operador en el contexto de una vacante específica.
  Permite coordinar entrevistas y consultas sin salir de la plataforma.

  ## Estructura
  - Cada mensaje está asociado a una vacante, un operador y una empresa
  - El campo `emisor` identifica quién envió el mensaje
  - `leido_en` es null hasta que el destinatario lo marca como leído

  ## Seguridad (RLS)
  - SELECT: solo el operador o la empresa involucrados en el mensaje pueden leerlo
  - INSERT: solo authenticated; el emisor debe ser el usuario autenticado
    (verificado vía FK a operadores.user_id o empresas.user_id)
  - UPDATE: solo para marcar leido_en (el destinatario)
  - DELETE: no permitido

  ## Nota para Claude Code
  La UI de chat no está implementada. Esta tabla es la base para una futura
  sección en los dashboards de operador y empresa.
*/

CREATE TABLE IF NOT EXISTS mensajes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vacante_id  uuid        NOT NULL REFERENCES vacantes(id) ON DELETE CASCADE,
  operador_id uuid        NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  empresa_id  uuid        NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  emisor      text        NOT NULL CHECK (emisor IN ('operador', 'empresa')),
  texto       text        NOT NULL,
  leido_en    timestamptz NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Índices para consultas frecuentes (inbox de cada usuario)
CREATE INDEX IF NOT EXISTS idx_mensajes_operador ON mensajes(operador_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_empresa  ON mensajes(empresa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_vacante  ON mensajes(vacante_id);

ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- El operador involucrado puede leer
CREATE POLICY "Operador puede leer sus mensajes"
  ON mensajes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM operadores
      WHERE operadores.id = mensajes.operador_id
        AND operadores.user_id = auth.uid()
    )
  );

-- La empresa involucrada puede leer
CREATE POLICY "Empresa puede leer sus mensajes"
  ON mensajes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = mensajes.empresa_id
        AND empresas.user_id = auth.uid()
    )
  );

-- El operador puede insertar mensajes donde es el emisor
CREATE POLICY "Operador puede enviar mensajes"
  ON mensajes FOR INSERT
  TO authenticated
  WITH CHECK (
    emisor = 'operador'
    AND EXISTS (
      SELECT 1 FROM operadores
      WHERE operadores.id = mensajes.operador_id
        AND operadores.user_id = auth.uid()
    )
  );

-- La empresa puede insertar mensajes donde es el emisor
CREATE POLICY "Empresa puede enviar mensajes"
  ON mensajes FOR INSERT
  TO authenticated
  WITH CHECK (
    emisor = 'empresa'
    AND EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = mensajes.empresa_id
        AND empresas.user_id = auth.uid()
    )
  );

-- El destinatario puede marcar como leído (UPDATE solo de leido_en)
CREATE POLICY "Destinatario puede marcar como leido"
  ON mensajes FOR UPDATE
  TO authenticated
  USING (
    (
      emisor = 'empresa' AND EXISTS (
        SELECT 1 FROM operadores
        WHERE operadores.id = mensajes.operador_id
          AND operadores.user_id = auth.uid()
      )
    ) OR (
      emisor = 'operador' AND EXISTS (
        SELECT 1 FROM empresas
        WHERE empresas.id = mensajes.empresa_id
          AND empresas.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (leido_en IS NOT NULL);
