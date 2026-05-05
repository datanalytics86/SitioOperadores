/*
  # Create empresas profile table

  1. New Tables
    - `empresas` — Perfil de empresa/empleador
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `nombre` (text)
      - `rut` (text, unique)
      - `telefono` (text)
      - `logo_url` (text, nullable)
      - `sitio_web` (text, nullable)
      - `descripcion` (text, nullable)
      - `region` (text)
      - `ciudad` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `empresas` table
    - Empresas can read/update their own profile
    - Operadores can read public empresa profiles
*/

CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  rut text UNIQUE NOT NULL,
  telefono text NOT NULL,
  logo_url text,
  sitio_web text,
  descripcion text,
  region text NOT NULL,
  ciudad text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas can read own profile"
  ON empresas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Empresas can update own profile"
  ON empresas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can read empresa profiles"
  ON empresas FOR SELECT
  TO anon
  USING (true);

CREATE INDEX idx_empresas_user_id ON empresas(user_id);
CREATE INDEX idx_empresas_region ON empresas(region);
