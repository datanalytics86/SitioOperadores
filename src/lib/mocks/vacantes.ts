import type { VacanteListItem } from '@/lib/data/vacantes';

/**
 * Mock data SOLO para desarrollo / demos.
 * Activar con NEXT_PUBLIC_USE_MOCKS=true o NODE_ENV=development
 * cuando la query real devuelve 0 resultados.
 */
export function shouldUseMocks(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') return true;
  if (process.env.NEXT_PUBLIC_USE_MOCKS === 'false') return false;
  return process.env.NODE_ENV === 'development';
}

export const VACANTES_MOCK: VacanteListItem[] = [
  {
    id: 'mock-1',
    titulo: 'Operador CAEX — Faena Norte',
    descripcion:
      'Se busca operador CAEX con experiencia mínima 5 años para faena en Atacama. Turno 14x7 con traslado incluido.',
    equipo_requerido: 'CAEX',
    region: 'Atacama',
    ciudad: 'Copiapó',
    turno: 'rotativo',
    salario_min: 3200000,
    salario_max: 4000000,
    cantidad_vacantes: 2,
    experiencia_minima: 5,
    activa: true,
    created_at: new Date().toISOString(),
    empresa: { nombre: 'Minera Atacama S.A.' },
  },
  {
    id: 'mock-2',
    titulo: 'Cargador Frontal Turno Día',
    descripcion:
      'Buscamos operador cargador frontal con licencia D para trabajo en construcción residencial. Contrato indefinido.',
    equipo_requerido: 'Cargador Frontal',
    region: 'Metropolitana',
    ciudad: 'Santiago',
    turno: 'mañana',
    salario_min: 2500000,
    salario_max: 3200000,
    cantidad_vacantes: 1,
    experiencia_minima: 2,
    activa: true,
    created_at: new Date().toISOString(),
    empresa: { nombre: 'Constructora XYZ' },
  },
  {
    id: 'mock-3',
    titulo: 'Retroexcavadora Urgente',
    descripcion:
      'Puesto urgente para retroexcavadora en proyecto de infraestructura vial. Experiencia en carreteras requerida.',
    equipo_requerido: 'Retroexcavadora',
    region: 'Valparaíso',
    ciudad: 'Viña del Mar',
    turno: 'tarde',
    salario_min: 2000000,
    salario_max: 2800000,
    cantidad_vacantes: 3,
    experiencia_minima: 1,
    activa: true,
    created_at: new Date().toISOString(),
    empresa: { nombre: 'Infraestructuras Chile' },
  },
  {
    id: 'mock-4',
    titulo: 'Operador Camión Minero',
    descripcion:
      'Gran oportunidad en faena minera de cobre. Turno 7x7, alojamiento y alimentación incluida.',
    equipo_requerido: 'Camión Minero',
    region: 'Antofagasta',
    ciudad: 'Calama',
    turno: 'rotativo',
    salario_min: 2800000,
    salario_max: 3500000,
    cantidad_vacantes: 4,
    experiencia_minima: 3,
    activa: true,
    created_at: new Date().toISOString(),
    empresa: { nombre: 'Codelco Norte' },
  },
  {
    id: 'mock-5',
    titulo: 'Excavadora Proyecto Portuario',
    descripcion:
      'Proyecto portuario en región de Los Lagos. Se busca operador con experiencia en obras marítimas.',
    equipo_requerido: 'Excavadora',
    region: 'Los Lagos',
    ciudad: 'Puerto Montt',
    turno: 'mañana',
    salario_min: 2200000,
    salario_max: 2900000,
    cantidad_vacantes: 2,
    experiencia_minima: 2,
    activa: true,
    created_at: new Date().toISOString(),
    empresa: { nombre: 'Puerto Sur S.A.' },
  },
  {
    id: 'mock-6',
    titulo: 'Bulldozer Minería del Carbón',
    descripcion:
      'Se requiere operador de bulldozer para operaciones en mina de carbón, Biobío. Turno rotativo.',
    equipo_requerido: 'Bulldozer',
    region: 'Biobío',
    ciudad: 'Coronel',
    turno: 'noche',
    salario_min: 2400000,
    salario_max: 3100000,
    cantidad_vacantes: 1,
    experiencia_minima: 4,
    activa: true,
    created_at: new Date().toISOString(),
    empresa: { nombre: 'Carbón Sur Ltda.' },
  },
];

export function filterMocks(filters: {
  equipo?: string;
  region?: string;
  turno?: string;
  q?: string;
  soloSalario?: boolean;
}): VacanteListItem[] {
  let list = [...VACANTES_MOCK];
  if (filters.equipo && filters.equipo !== 'Todos') {
    list = list.filter((v) => v.equipo_requerido === filters.equipo);
  }
  if (filters.region && filters.region !== 'Todas') {
    list = list.filter((v) => v.region === filters.region);
  }
  if (filters.turno && filters.turno !== 'Todos') {
    list = list.filter((v) => v.turno === filters.turno);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter((v) => v.titulo.toLowerCase().includes(q));
  }
  if (filters.soloSalario) {
    list = list.filter((v) => v.salario_min != null);
  }
  return list;
}
