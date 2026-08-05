'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EQUIPOS, REGIONES, TURNOS } from '@/lib/constants/chile';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

/**
 * Filtros client-side que sincronizan con URL searchParams.
 * La búsqueda de texto usa debounce real (350ms) antes de navegar.
 */
export function VacantesFilters({
  variant = 'sidebar',
}: {
  variant?: 'sidebar' | 'inline';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '');
  const debouncedQ = useDebouncedValue(busqueda, 350);

  const equipo = searchParams.get('equipo') || '';
  const region = searchParams.get('region') || '';
  const turno = searchParams.get('turno') || '';
  const soloSalario = searchParams.get('salario') === '1';

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'Todos' || value === 'Todas') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset page on filter change
      if (!('page' in updates)) params.delete('page');
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  // Debounced search → URL
  useEffect(() => {
    const current = searchParams.get('q') || '';
    if (debouncedQ === current) return;
    pushParams({ q: debouncedQ || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const clearFilters = () => {
    setBusqueda('');
    startTransition(() => router.push(pathname));
  };

  const activeFilters = [equipo, region, turno, busqueda, soloSalario].filter(
    Boolean
  ).length;

  if (variant === 'inline') {
    return (
      <div className="bg-ink-700 rounded-xl border border-ink-600 p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <FilterSelect
            label="Equipo"
            value={equipo || 'Todos'}
            options={['Todos', ...EQUIPOS]}
            onChange={(v) => pushParams({ equipo: v === 'Todos' ? null : v })}
          />
          <FilterSelect
            label="Región"
            value={region || 'Todas'}
            options={['Todas', ...REGIONES]}
            onChange={(v) => pushParams({ region: v === 'Todas' ? null : v })}
          />
          <FilterSelect
            label="Turno"
            value={turno || 'Todos'}
            options={['Todos', ...TURNOS]}
            onChange={(v) => pushParams({ turno: v === 'Todos' ? null : v })}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Buscar
            </label>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Título del cargo..."
              className="w-full px-4 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-faena text-sm"
              aria-label="Buscar vacantes"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {isPending ? 'Actualizando…' : activeFilters > 0 ? `${activeFilters} filtro(s)` : 'Sin filtros'}
          </p>
          {activeFilters > 0 && (
            <button type="button" onClick={clearFilters} className="text-sm text-faena-300 hover:text-faena">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    );
  }

  // Sidebar variant
  return (
    <div className="sticky top-20 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Filtros</h2>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-faena-300 hover:text-faena"
          >
            Limpiar ({activeFilters})
          </button>
        )}
      </div>

      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
          Buscar
        </label>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Cargo, equipo..."
          className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-faena"
        />
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Equipo</p>
        <div className="space-y-0.5">
          {EQUIPOS.map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => pushParams({ equipo: equipo === eq ? null : eq })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                equipo === eq
                  ? 'bg-faena/20 text-faena-300'
                  : 'text-gray-400 hover:text-white hover:bg-ink-700'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Turno</p>
        <div className="space-y-0.5">
          {TURNOS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => pushParams({ turno: turno === t ? null : t })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                turno === t
                  ? 'bg-faena/20 text-faena-300'
                  : 'text-gray-400 hover:text-white hover:bg-ink-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Región</p>
        <select
          value={region}
          onChange={(e) => pushParams({ region: e.target.value || null })}
          className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-faena"
        >
          <option value="">Todas</option>
          {REGIONES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <button
          type="button"
          role="switch"
          aria-checked={soloSalario}
          onClick={() => pushParams({ salario: soloSalario ? null : '1' })}
          className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
            soloSalario ? 'bg-faena' : 'bg-ink-600'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              soloSalario ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className="text-sm text-gray-300">Solo con sueldo</span>
      </label>

      <Link
        href="/auth/signup?role=empresa"
        className="btn-primary w-full text-center text-sm py-2.5 block"
      >
        + Publicar vacante
      </Link>

      {isPending && (
        <p className="text-xs text-gray-500 text-center" aria-live="polite">
          Actualizando…
        </p>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena text-sm capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
