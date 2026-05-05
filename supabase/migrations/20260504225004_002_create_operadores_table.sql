/*
  # Create operadores profile table

  1. New Tables
    - `operadores` — Perfil completo del operador
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `nombre_completo` (text)
      - `rut` (text, unique)
      - `telefono` (text)
      - `años_experiencia` (integer)
      - `avatar_url` (text, nullable)
      - `cv_url` (text, nullable)
      - `licencias` (text array)
      - `equipos_operados` (text array)
      - `certificaciones` (text array)
      - `region` (text)
      - `ciudad` (text)
      - `disponible` (boolean, default true)
      - `bio` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `operadores` table
    - Operadores can read/update their own profile
    - Empresas can read public operador profiles with disponible=true
*/

CREATE TABLE IF NOT EXISTS operadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre_completo text NOT NULL,
  rut text UNIQUE NOT NULL,
  telefono text NOT NULL,
  años_experiencia integer NOT NULL DEFAULT 0,
  avatar_url text,
  cv_url text,
  licencias text[] DEFAULT '{}',
  equipos_operados text[] DEFAULT '{}',
  certificaciones text[] DEFAULT '{}',
  region text NOT NULL,
  ciudad text NOT NULL,
  disponible boolean DEFAULT true,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE operadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operadores can read own profile"
  ON operadores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Operadores can update own profile"
  ON operadores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Empresas can read available operadores"
  ON operadores FOR SELECT
  TO authenticated
  USING (
    disponible = true AND
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'empresa'
    )
  );

CREATE POLICY "Public can read available operadores"
  ON operadores FOR SELECT
  TO anon
  USING (disponible = true);

CREATE INDEX idx_operadores_user_id ON operadores(user_id);
CREATE INDEX idx_operadores_disponible ON operadores(disponible);
CREATE INDEX idx_operadores_region ON operadores(region);
