import { createClient } from '@/lib/supabase/server';
import { filterMocks, shouldUseMocks } from '@/lib/mocks/vacantes';

export type VacanteListItem = {
  id: string;
  titulo: string;
  descripcion: string;
  equipo_requerido: string;
  region: string;
  ciudad: string;
  turno: string;
  salario_min?: number | null;
  salario_max?: number | null;
  cantidad_vacantes: number;
  experiencia_minima: number;
  activa: boolean;
  created_at: string;
  empresa?: { nombre: string; logo_url?: string | null } | null;
};

export type VacantesQuery = {
  equipo?: string;
  region?: string;
  turno?: string;
  q?: string;
  soloSalario?: boolean;
  page?: number;
  pageSize?: number;
};

export type VacantesResult = {
  data: VacanteListItem[];
  total: number;
  fromMock: boolean;
};

export const VACANTES_TAG = 'vacantes';
export const REVALIDATE_VACANTES = 60; // segundos

/**
 * Fetch server-side de vacantes activas.
 * Usa revalidate vía unstable_cache o fetch tags en el caller.
 */
export async function getVacantes(
  query: VacantesQuery = {}
): Promise<VacantesResult> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 9));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = await createClient();

    let q = supabase
      .from('vacantes')
      .select('*, empresa:empresas(nombre, logo_url)', { count: 'exact' })
      .eq('activa', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (query.equipo && query.equipo !== 'Todos') {
      q = q.eq('equipo_requerido', query.equipo);
    }
    if (query.region && query.region !== 'Todas') {
      q = q.eq('region', query.region);
    }
    if (query.turno && query.turno !== 'Todos') {
      q = q.eq('turno', query.turno);
    }
    if (query.q) {
      q = q.ilike('titulo', `%${query.q}%`);
    }
    if (query.soloSalario) {
      q = q.not('salario_min', 'is', null);
    }

    const { data, count, error } = await q;

    if (error) throw error;

    if (data && data.length > 0) {
      return {
        data: data as VacanteListItem[],
        total: count ?? data.length,
        fromMock: false,
      };
    }

    // Solo mocks en dev o con flag explícito
    if (shouldUseMocks()) {
      const filtered = filterMocks(query);
      const slice = filtered.slice(from, from + pageSize);
      return { data: slice, total: filtered.length, fromMock: true };
    }

    return { data: [], total: 0, fromMock: false };
  } catch {
    if (shouldUseMocks()) {
      const filtered = filterMocks(query);
      const slice = filtered.slice(from, from + pageSize);
      return { data: slice, total: filtered.length, fromMock: true };
    }
    return { data: [], total: 0, fromMock: false };
  }
}

export async function getVacanteById(
  id: string
): Promise<VacanteListItem | null> {
  if (id.startsWith('mock-')) {
    if (!shouldUseMocks()) return null;
    return filterMocks({}).find((v) => v.id === id) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('vacantes')
      .select('*, empresa:empresas(nombre, logo_url)')
      .eq('id', id)
      .eq('activa', true)
      .maybeSingle();

    if (error) throw error;
    return (data as VacanteListItem) ?? null;
  } catch {
    return null;
  }
}
