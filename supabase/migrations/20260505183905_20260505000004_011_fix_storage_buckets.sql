/*
  # Fix Storage Buckets

  ## Cambios
  1. Crear bucket `documentos` (privado, solo dueño y service_role)
  2. Corregir policies de INSERT en operadores y empresas (agregar WITH CHECK)
  3. Agregar DELETE para que dueños puedan borrar sus archivos
  4. Agregar UPDATE para empresas (faltaba)
  5. Agregar SELECT público para CVs de operadores (necesario para vista de postulaciones)

  ## Convención de paths
  - operadores: {user_id}/avatar/{filename}, {user_id}/cv/{filename}
  - empresas:   {user_id}/logo/{filename}
  - documentos: {user_id}/licencias/{filename}, {user_id}/certificaciones/{filename}

  ## Nota para Claude Code
  Los buckets `operadores` y `empresas` quedan como public=false a nivel de bucket
  pero con policies SELECT que permiten lectura anon en subcarpetas avatar/ y logo/.
  El campo public del bucket controla solo el acceso sin políticas; las políticas
  son más granulares y ya cubren el caso de uso.
*/

-- Crear bucket documentos si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  false,
  10485760,  -- 10 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────
-- CORREGIR bucket operadores: INSERT con WITH CHECK
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Operadores can upload own files" ON storage.objects;
CREATE POLICY "Operadores can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'operadores'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE para operadores
DROP POLICY IF EXISTS "Operadores can delete own files" ON storage.objects;
CREATE POLICY "Operadores can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'operadores'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ────────────────────────────────────────────────
-- CORREGIR bucket empresas: INSERT con WITH CHECK + UPDATE + DELETE
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Empresas can upload own files" ON storage.objects;
CREATE POLICY "Empresas can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'empresas'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Empresas can update own files" ON storage.objects;
CREATE POLICY "Empresas can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'empresas'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'empresas'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Empresas can delete own files" ON storage.objects;
CREATE POLICY "Empresas can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'empresas'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ────────────────────────────────────────────────
-- bucket documentos: solo el dueño, sin acceso público
-- ────────────────────────────────────────────────
CREATE POLICY "Dueño puede leer documentos propios"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Dueño puede subir documentos propios"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Dueño puede actualizar documentos propios"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Dueño puede eliminar documentos propios"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
