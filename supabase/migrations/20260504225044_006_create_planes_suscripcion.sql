/*
  # Create subscription plans and related tables

  1. New Tables
    - `planes_suscripcion` — Planes de pago para empresas
      - `id` (uuid, primary key)
      - `nombre` (text)
      - `precio` (integer, en CLP)
      - `vacantes_incluidas` (integer)
      - `caracteristicas` (text array)
      - `activo` (boolean)

    - `suscripciones_empresa` — Suscripción activa de empresa
      - `id` (uuid, primary key)
      - `empresa_id` (uuid, references empresas)
      - `plan_id` (uuid, references planes_suscripcion)
      - `estado` (enum: 'activa', 'cancelada', 'vencida')
      - `fecha_inicio` (date)
      - `fecha_fin` (date)
      - `renovacion_automatica` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `pagos` — Registro de pagos
      - `id` (uuid, primary key)
      - `suscripcion_id` (uuid, references suscripciones_empresa)
      - `monto` (integer)
      - `moneda` (text, default 'CLP')
      - `estado` (enum: 'pendiente', 'completado', 'fallido', 'reembolsado')
      - `metodo_pago` (text)
      - `referencia_externa` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
*/

CREATE TABLE IF NOT EXISTS planes_suscripcion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  precio integer NOT NULL,
  vacantes_incluidas integer NOT NULL DEFAULT 5,
  caracteristicas text[] DEFAULT '{}',
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE planes_suscripcion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active planes"
  ON planes_suscripcion FOR SELECT
  USING (activo = true);

-- Insert default plans
INSERT INTO planes_suscripcion (nombre, precio, vacantes_incluidas, caracteristicas) VALUES
  ('Starter', 29900, 3, ARRAY['3 vacantes activas', 'Hasta 30 días', 'Soporte email']),
  ('Pro', 79900, 10, ARRAY['10 vacantes activas', 'Hasta 90 días', 'Soporte prioritario', 'Análisis básico']),
  ('Enterprise', 199900, 50, ARRAY['50 vacantes activas', 'Hasta 1 año', 'Soporte 24/7', 'Análisis avanzado', 'API access'])
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS suscripciones_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES planes_suscripcion(id),
  estado text DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada', 'vencida')),
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  renovacion_automatica boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suscripciones_empresa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas can read own subscription"
  ON suscripciones_empresa FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = suscripciones_empresa.empresa_id
      AND empresas.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suscripcion_id uuid NOT NULL REFERENCES suscripciones_empresa(id) ON DELETE CASCADE,
  monto integer NOT NULL,
  moneda text DEFAULT 'CLP',
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado')),
  metodo_pago text NOT NULL,
  referencia_externa text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas can read own payments"
  ON pagos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suscripciones_empresa
      WHERE suscripciones_empresa.id = pagos.suscripcion_id
      AND EXISTS (
        SELECT 1 FROM empresas
        WHERE empresas.id = suscripciones_empresa.empresa_id
        AND empresas.user_id = auth.uid()
      )
    )
  );

CREATE INDEX idx_suscripciones_empresa_id ON suscripciones_empresa(empresa_id);
CREATE INDEX idx_suscripciones_estado ON suscripciones_empresa(estado);
CREATE INDEX idx_pagos_suscripcion_id ON pagos(suscripcion_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);
