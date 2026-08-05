/** Catálogos de dominio Chile — usados en UI y validaciones */

export const EQUIPOS = [
  'CAEX',
  'Cargador Frontal',
  'Retroexcavadora',
  'Camión Minero',
  'Excavadora',
  'Bulldozer',
  'Motoniveladora',
  'Grúa',
  'Rodillo Compactador',
  'Manipulador Telescópico',
] as const;

export const REGIONES = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
] as const;

export const TURNOS = ['mañana', 'tarde', 'noche', 'rotativo'] as const;

export const LICENCIAS = ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E', 'F'] as const;

export const CERTIFICACIONES = [
  'Curso Faena Minera',
  'Manejo Defensivo',
  'Trabajo en Altura',
  'Riesgos Específicos',
  'Primeros Auxilios',
  'IRATA',
  'OSHA',
] as const;

export type Equipo = (typeof EQUIPOS)[number];
export type Region = (typeof REGIONES)[number];
export type Turno = (typeof TURNOS)[number];
