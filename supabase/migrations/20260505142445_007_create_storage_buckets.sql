/*
  # Create Storage Buckets for File Uploads

  1. Buckets
    - `operadores` — CV, fotos y documentos de operadores
    - `empresas` — Logos y documentos de empresas

  2. Security
    - Operadores pueden subir/leer sus propios archivos
    - Empresas pueden subir/leer sus propios archivos
    - Archivos de perfil (avatares, logos) son públicos para lectura
*/

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('operadores', 'operadores', false),
  ('empresas', 'empresas', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Operadores can upload their own files
CREATE POLICY "Operadores can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'operadores' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Operadores can read their own files
CREATE POLICY "Operadores can read own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'operadores' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Operadores can update their own files
CREATE POLICY "Operadores can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'operadores' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'operadores' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Empresas can upload their own files
CREATE POLICY "Empresas can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'empresas' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Empresas can read their own files
CREATE POLICY "Empresas can read own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'empresas' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Public can read avatars and logos (subfolder 'avatar' and 'logo')
CREATE POLICY "Public can read avatars"
  ON storage.objects FOR SELECT
  TO anon
  USING (
    (bucket_id = 'operadores' AND (storage.foldername(name))[2] = 'avatar') OR
    (bucket_id = 'empresas' AND (storage.foldername(name))[2] = 'logo')
  );
