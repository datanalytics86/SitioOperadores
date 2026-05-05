/*
  # Create postulaciones table

  1. New Tables
    - `postulaciones` — Aplicaciones de operadores a vacantes
      - `id` (uuid, primary key)
      - `vacante_id` (uuid, references vacantes)
      - `operador_id` (uuid, references operadores)
      - `estado` (enum: 'pendiente', 'visto', 'aceptado', 'rechazado')
      - `comentarios_empresa` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `postulaciones` table
    - Operadores can create and read their own postulaciones
    - Empresas can read/update postulaciones for their vacantes
*/

CREATE TABLE IF NOT EXISTS postulaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vacante_id uuid NOT NULL REFERENCES vacantes(id) ON DELETE CASCADE,
  operador_id uuid NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'visto', 'aceptado', 'rechazado')),
  comentarios_empresa text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vacante_id, operador_id)
);

ALTER TABLE postulaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operadores can create postulaciones"
  ON postulaciones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM operadores
      WHERE operadores.id = postulaciones.operador_id
      AND operadores.user_id = auth.uid()
    )
  );

CREATE POLICY "Operadores can read own postulaciones"
  ON postulaciones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM operadores
      WHERE operadores.id = postulaciones.operador_id
      AND operadores.user_id = auth.uid()
    )
  );

CREATE POLICY "Empresas can read postulaciones for their vacantes"
  ON postulaciones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vacantes
      WHERE vacantes.id = postulaciones.vacante_id
      AND EXISTS (
        SELECT 1 FROM empresas
        WHERE empresas.id = vacantes.empresa_id
        AND empresas.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Empresas can update postulaciones for their vacantes"
  ON postulaciones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vacantes
      WHERE vacantes.id = postulaciones.vacante_id
      AND EXISTS (
        SELECT 1 FROM empresas
        WHERE empresas.id = vacantes.empresa_id
        AND empresas.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vacantes
      WHERE vacantes.id = postulaciones.vacante_id
      AND EXISTS (
        SELECT 1 FROM empresas
        WHERE empresas.id = vacantes.empresa_id
        AND empresas.user_id = auth.uid()
      )
    )
  );

CREATE INDEX idx_postulaciones_operador_id ON postulaciones(operador_id);
CREATE INDEX idx_postulaciones_vacante_id ON postulaciones(vacante_id);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);
