/*
  # Create vacantes table

  1. New Tables
    - `vacantes` — Ofertas de trabajo
      - `id` (uuid, primary key)
      - `empresa_id` (uuid, references empresas)
      - `titulo` (text)
      - `descripcion` (text)
      - `equipo_requerido` (text)
      - `licencias_requeridas` (text array)
      - `certificaciones_requeridas` (text array)
      - `experiencia_minima` (integer)
      - `region` (text)
      - `ciudad` (text)
      - `turno` (enum: 'mañana', 'tarde', 'noche', 'rotativo')
      - `salario_min` (integer, nullable)
      - `salario_max` (integer, nullable)
      - `cantidad_vacantes` (integer, default 1)
      - `activa` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `vacantes` table
    - Empresas can create/read/update/delete their own vacantes
    - Operadores can read active vacantes
    - Public can read active vacantes
*/

CREATE TABLE IF NOT EXISTS vacantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text NOT NULL,
  equipo_requerido text NOT NULL,
  licencias_requeridas text[] DEFAULT '{}',
  certificaciones_requeridas text[] DEFAULT '{}',
  experiencia_minima integer DEFAULT 0,
  region text NOT NULL,
  ciudad text NOT NULL,
  turno text NOT NULL CHECK (turno IN ('mañana', 'tarde', 'noche', 'rotativo')),
  salario_min integer,
  salario_max integer,
  cantidad_vacantes integer DEFAULT 1,
  activa boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vacantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas can manage own vacantes"
  ON vacantes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = vacantes.empresa_id
      AND empresas.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = vacantes.empresa_id
      AND empresas.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read active vacantes"
  ON vacantes FOR SELECT
  USING (activa = true);

CREATE INDEX idx_vacantes_empresa_id ON vacantes(empresa_id);
CREATE INDEX idx_vacantes_activa ON vacantes(activa);
CREATE INDEX idx_vacantes_region ON vacantes(region);
CREATE INDEX idx_vacantes_equipo ON vacantes(equipo_requerido);
