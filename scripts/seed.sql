/*
  Seed de datos realistas para OperadoresFaena.cl (Chile 2026)

  USO:
  1. Crear usuarios de prueba en Supabase Auth Dashboard (o signup UI):
     - operador.demo@operadoresfaena.cl  (role: operador)
     - empresa.demo@operadoresfaena.cl   (role: empresa)
  2. Reemplazar los UUIDs abajo por los id reales de auth.users
  3. Ejecutar en SQL Editor

  Este script es IDEMPOTENTE en vacantes (usa ON CONFLICT solo donde hay unique).
  No inserta en auth.users (el trigger 008 lo hace en signup).
*/

-- ═══════════════════════════════════════════
-- 0. Placeholders — REEMPLAZAR
-- ═══════════════════════════════════════════
-- SELECT id, email FROM auth.users;

-- Ejemplo (cambiar):
-- \set operador_user_id '00000000-0000-0000-0000-000000000001'
-- \set empresa_user_id  '00000000-0000-0000-0000-000000000002'

DO $$
DECLARE
  v_op_user  uuid;
  v_emp_user uuid;
  v_op_id    uuid;
  v_emp_id   uuid;
  v_vac_ids  uuid[] := ARRAY[]::uuid[];
  v_id       uuid;
BEGIN
  -- Buscar usuarios demo por email (si existen)
  SELECT id INTO v_op_user FROM auth.users WHERE email = 'operador.demo@operadoresfaena.cl' LIMIT 1;
  SELECT id INTO v_emp_user FROM auth.users WHERE email = 'empresa.demo@operadoresfaena.cl' LIMIT 1;

  IF v_op_user IS NULL OR v_emp_user IS NULL THEN
    RAISE NOTICE 'Crea primero las cuentas demo vía /auth/signup y vuelve a ejecutar el seed.';
    RAISE NOTICE 'Emails esperados: operador.demo@operadoresfaena.cl y empresa.demo@operadoresfaena.cl';
    RETURN;
  END IF;

  -- Asegurar filas en public.users
  INSERT INTO public.users (id, email, role)
  VALUES
    (v_op_user, 'operador.demo@operadoresfaena.cl', 'operador'),
    (v_emp_user, 'empresa.demo@operadoresfaena.cl', 'empresa')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  -- Operador demo
  INSERT INTO public.operadores (
    user_id, nombre_completo, rut, telefono, años_experiencia,
    licencias, equipos_operados, certificaciones,
    region, ciudad, disponible, bio
  ) VALUES (
    v_op_user,
    'Carlos Muñoz Riquelme',
    '15.234.567-8',
    '+56 9 8765 4321',
    8,
    ARRAY['A3', 'A4', 'D'],
    ARRAY['CAEX', 'Camión Minero', 'Cargador Frontal'],
    ARRAY['Curso Faena Minera', 'Manejo Defensivo', 'Primeros Auxilios'],
    'Atacama',
    'Copiapó',
    true,
    'Operador CAEX con 8 años en faena cuprífera. Disponible turno 14x7.'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nombre_completo = EXCLUDED.nombre_completo,
    disponible = true
  RETURNING id INTO v_op_id;

  IF v_op_id IS NULL THEN
    SELECT id INTO v_op_id FROM public.operadores WHERE user_id = v_op_user;
  END IF;

  -- Empresa demo
  INSERT INTO public.empresas (
    user_id, nombre, rut, telefono, region, ciudad, descripcion, sitio_web
  ) VALUES (
    v_emp_user,
    'Minera Atacama Norte SpA',
    '76.543.210-K',
    '+56 2 2345 6789',
    'Atacama',
    'Copiapó',
    'Operaciones mineras de cobre y oro en la III Región. Buscamos operadores calificados.',
    'https://ejemplo-minera.cl'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nombre = EXCLUDED.nombre
  RETURNING id INTO v_emp_id;

  IF v_emp_id IS NULL THEN
    SELECT id INTO v_emp_id FROM public.empresas WHERE user_id = v_emp_user;
  END IF;

  -- Vacantes realistas Chile
  INSERT INTO public.vacantes (
    empresa_id, titulo, descripcion, equipo_requerido,
    experiencia_minima, region, ciudad, turno,
    salario_min, salario_max, cantidad_vacantes, activa
  ) VALUES
  (
    v_emp_id,
    'Operador CAEX — Faena Candelaria',
    'Buscamos operador de camión extrapesado (CAEX) para faena cuprífera. Turno 14x7 con traslado desde Copiapó, campamento y alimentación. Licencia A4 o superior y curso de inducción minera.',
    'CAEX', 5, 'Atacama', 'Copiapó', 'rotativo',
    3200000, 4100000, 3, true
  ),
  (
    v_emp_id,
    'Cargador Frontal — Planta de Áridos',
    'Operación de cargador frontal en planta de áridos. Turno diurno, contrato indefinido. Experiencia mínima 2 años y licencia D.',
    'Cargador Frontal', 2, 'Metropolitana', 'Puente Alto', 'mañana',
    1800000, 2400000, 2, true
  ),
  (
    v_emp_id,
    'Operador Retroexcavadora — Obras Viales',
    'Proyecto de mejoramiento de ruta en región de Valparaíso. Experiencia en obras viales. Turno tarde.',
    'Retroexcavadora', 3, 'Valparaíso', 'Quilpué', 'tarde',
    1600000, 2200000, 1, true
  ),
  (
    v_emp_id,
    'Camión Minero 777 — Distrito Norte',
    'Operación de camión minero Cat 777 en faena del norte. Turno 7x7. Alojamiento incluido.',
    'Camión Minero', 4, 'Antofagasta', 'Calama', 'rotativo',
    2800000, 3600000, 4, true
  ),
  (
    v_emp_id,
    'Bulldozer D8 — Movimiento de Tierra',
    'Proyecto de movimiento de tierra en Biobío. Experiencia con D8 o similar. Turno rotativo.',
    'Bulldozer', 3, 'Biobío', 'Concepción', 'rotativo',
    2000000, 2700000, 1, true
  ),
  (
    v_emp_id,
    'Motoniveladora — Mantención Caminos Mineros',
    'Mantención de caminos de acceso a faena. Región de Coquimbo. Turno mañana.',
    'Motoniveladora', 2, 'Coquimbo', 'La Serena', 'mañana',
    1700000, 2300000, 2, true
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed completado. Operador id=%, Empresa id=%', v_op_id, v_emp_id;
END $$;
