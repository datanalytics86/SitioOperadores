'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostulacionModal from '@/components/PostulacionModal';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

const EQUIPOS = ['CAEX', 'Cargador Frontal', 'Retroexcavadora', 'Camión Minero', 'Excavadora', 'Bulldozer', 'Motoniveladora', 'Grúa'];
const REGIONES = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'];
const TURNOS = ['mañana', 'tarde', 'noche', 'rotativo'];
const PAGE_SIZE = 9;

interface Vacante {
  id: string;
  titulo: string;
  descripcion: string;
  equipo_requerido: string;
  region: string;
  ciudad: string;
  turno: string;
  salario_min?: number;
  salario_max?: number;
  cantidad_vacantes: number;
  experiencia_minima: number;
  activa: boolean;
  created_at: string;
  empresa?: { nombre: string };
}

const MOCK: Vacante[] = [
  { id: 'mock-1', titulo: 'Operador CAEX Faena Norte', descripcion: 'Turno 14x7 con traslado y alimentación.', equipo_requerido: 'CAEX', region: 'Atacama', ciudad: 'Copiapó', turno: 'rotativo', salario_min: 3200000, salario_max: 4000000, cantidad_vacantes: 2, experiencia_minima: 5, activa: true, created_at: new Date().toISOString(), empresa: { nombre: 'Minera Atacama S.A.' } },
  { id: 'mock-2', titulo: 'Cargador Frontal Turno Día', descripcion: 'Contrato indefinido en construcción residencial.', equipo_requerido: 'Cargador Frontal', region: 'Metropolitana', ciudad: 'Santiago', turno: 'mañana', salario_min: 2500000, salario_max: 3200000, cantidad_vacantes: 1, experiencia_minima: 2, activa: true, created_at: new Date().toISOString(), empresa: { nombre: 'Constructora XYZ' } },
  { id: 'mock-3', titulo: 'Retroexcavadora Urgente', descripcion: 'Proyecto vial urgente. Experiencia en carreteras.', equipo_requerido: 'Retroexcavadora', region: 'Valparaíso', ciudad: 'Viña del Mar', turno: 'tarde', salario_min: 2000000, salario_max: 2800000, cantidad_vacantes: 3, experiencia_minima: 1, activa: true, created_at: new Date().toISOString(), empresa: { nombre: 'Infraestructuras Chile' } },
  { id: 'mock-4', titulo: 'Camión Minero Cobre', descripcion: 'Faena cuprífera 7x7. Alojamiento incluido.', equipo_requerido: 'Camión Minero', region: 'Antofagasta', ciudad: 'Calama', turno: 'rotativo', salario_min: 2800000, salario_max: 3500000, cantidad_vacantes: 4, experiencia_minima: 3, activa: true, created_at: new Date().toISOString(), empresa: { nombre: 'Codelco Norte' } },
  { id: 'mock-5', titulo: 'Excavadora Proyecto Portuario', descripcion: 'Obra marítima en Los Lagos.', equipo_requerido: 'Excavadora', region: 'Los Lagos', ciudad: 'Puerto Montt', turno: 'mañana', salario_min: 2200000, salario_max: 2900000, cantidad_vacantes: 2, experiencia_minima: 2, activa: true, created_at: new Date().toISOString(), empresa: { nombre: 'Puerto Sur S.A.' } },
  { id: 'mock-6', titulo: 'Bulldozer Minería Carbón', descripcion: 'Operaciones en mina de carbón, Biobío.', equipo_requerido: 'Bulldozer', region: 'Biobío', ciudad: 'Coronel', turno: 'noche', salario_min: 2400000, salario_max: 3100000, cantidad_vacantes: 1, experiencia_minima: 4, activa: true, created_at: new Date().toISOString(), empresa: { nombre: 'Carbón Sur Ltda.' } },
  { id: 'mock-7', titulo: 'Motoniveladora Construcción', descripcion: 'Proyecto habitacional Araucanía.', equipo_requerido: 'Motoniveladora', region: 'La Araucanía', ciudad: 'Temuco', turno: 'mañana', salario_min: 1900000, salario_max: 2600000, cantidad_vacantes: 1, experiencia_minima: 2, activa: true, created_at: new Date().toISOString(), empresa: { nombre: 'Obras Sur Ltda.' } },
  { id: 'mock-8', titulo: 'CAEX Minería de Hierro', descripcion: 'Faena minera norte. Excelentes beneficios.', equipo_requerido: 'CAEX', region: 'Tarapacá', ciudad: 'Iquique', turno: 'rotativo', salario_min: 3500000, salario_max: 4500000, cantidad_vacantes: 5, experiencia_minima: 6, activa: true, created_at: new Date().toISOString(), empresa: { nombre: 'Hierro Norte S.A.' } },
  { id: 'mock-9', titulo: 'Cargador Frontal Áridos', descripcion: 'Planta de áridos en Coquimbo. Turno fijo.', equipo_requerido: 'Cargador Frontal', region: 'Coquimbo', ciudad: 'La Serena', turno: 'tarde', salario_min: 2100000, salario_max: 2700000, cantidad_vacantes: 2, experiencia_minima: 1, activa: true, created_at: new Date().toISOString(), empresa: { nombre: 'Áridos Coquimbo' } },
];

function VacantesContent() {
  const searchParams = useSearchParams();
  const [vacantes, setVacantes] = useState<Vacante[]>(MOCK);
  const [total, setTotal] = useState(MOCK.length);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [equipo, setEquipo] = useState('');
  const [region, setRegion] = useState('');
  const [turno, setTurno] = useState('');
  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '');
  const [soloSalario, setSoloSalario] = useState(false);

  const [postulacionVacante, setPostulacionVacante] = useState<Vacante | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('vacantes')
        .select('*, empresa:empresas(nombre)', { count: 'exact' })
        .eq('activa', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (equipo) q = q.eq('equipo_requerido', equipo);
      if (region) q = q.eq('region', region);
      if (turno) q = q.eq('turno', turno);
      if (busqueda) q = q.ilike('titulo', `%${busqueda}%`);
      if (soloSalario) q = q.not('salario_min', 'is', null);

      const { data, count } = await q;
      if (data && data.length > 0) {
        setVacantes(data);
        setTotal(count || 0);
      } else {
        let filtered = MOCK;
        if (equipo) filtered = filtered.filter(v => v.equipo_requerido === equipo);
        if (region) filtered = filtered.filter(v => v.region === region);
        if (turno) filtered = filtered.filter(v => v.turno === turno);
        if (busqueda) filtered = filtered.filter(v => v.titulo.toLowerCase().includes(busqueda.toLowerCase()));
        if (soloSalario) filtered = filtered.filter(v => v.salario_min);
        setVacantes(filtered);
        setTotal(filtered.length);
      }
    } finally {
      setLoading(false);
    }
  }, [equipo, region, turno, busqueda, soloSalario, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const clearFilters = () => { setEquipo(''); setRegion(''); setTurno(''); setBusqueda(''); setSoloSalario(false); setPage(1); };
  const activeFilters = [equipo, region, turno, busqueda, soloSalario].filter(Boolean).length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-16">
        {/* Header */}
        <div className="bg-ink-700 border-b border-ink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="section-label mb-2">Chile &middot; {total} empleos</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-5">Empleos para Operadores</h1>
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetch()}
                  placeholder="Buscar por cargo, equipo..."
                  className="w-full pl-10 pr-4 py-3 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-faena" />
              </div>
              <button onClick={fetch} className="btn-primary px-8 py-3">Buscar</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <aside className="lg:w-52 flex-shrink-0">
              <div className="sticky top-20 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Filtros</h2>
                  {activeFilters > 0 && (
                    <button onClick={clearFilters} className="text-xs text-faena-300 hover:text-faena">
                      Limpiar ({activeFilters})
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Equipo</p>
                  <div className="space-y-0.5">
                    {EQUIPOS.map(eq => (
                      <button key={eq} onClick={() => { setEquipo(equipo === eq ? '' : eq); setPage(1); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          equipo === eq ? 'bg-faena/20 text-faena-300' : 'text-gray-400 hover:text-white hover:bg-ink-700'
                        }`}>
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Turno</p>
                  <div className="space-y-0.5">
                    {TURNOS.map(t => (
                      <button key={t} onClick={() => { setTurno(turno === t ? '' : t); setPage(1); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                          turno === t ? 'bg-faena/20 text-faena-300' : 'text-gray-400 hover:text-white hover:bg-ink-700'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Región</p>
                  <select value={region} onChange={e => { setRegion(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-faena">
                    <option value="">Todas</option>
                    {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => { setSoloSalario(!soloSalario); setPage(1); }}
                    className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${soloSalario ? 'bg-faena' : 'bg-ink-600'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${soloSalario ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm text-gray-300">Solo con sueldo</span>
                </label>

                <Link href="/auth/signup?role=empresa" className="btn-primary w-full text-center text-sm py-2.5 block">
                  + Publicar vacante
                </Link>
              </div>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
              {activeFilters > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {equipo && <Chip label={equipo} onRemove={() => setEquipo('')} />}
                  {region && <Chip label={region} onRemove={() => setRegion('')} />}
                  {turno && <Chip label={turno} onRemove={() => setTurno('')} />}
                  {busqueda && <Chip label={`"${busqueda}"`} onRemove={() => setBusqueda('')} />}
                  {soloSalario && <Chip label="Con sueldo" onRemove={() => setSoloSalario(false)} />}
                </div>
              )}

              <p className="text-sm text-gray-400 mb-5">
                {loading ? 'Buscando...' : `${total} empleo${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
              </p>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card p-5 animate-pulse">
                      <div className="h-3 bg-ink-600 rounded w-1/3 mb-3" />
                      <div className="h-5 bg-ink-600 rounded w-3/4 mb-4" />
                      <div className="space-y-2">
                        <div className="h-3 bg-ink-600 rounded" />
                        <div className="h-3 bg-ink-600 rounded w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : vacantes.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400 mb-4">No hay empleos con esos filtros.</p>
                  <button onClick={clearFilters} className="btn-secondary text-sm">Limpiar filtros</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {vacantes.map(v => (
                    <JobCard key={v.id} vacante={v} onPostular={() => setPostulacionVacante(v)} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
                    &larr; Anterior
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => (
                      <button key={i + 1} onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                          i + 1 === page ? 'bg-faena text-black' : 'text-gray-400 hover:text-white hover:bg-ink-700'
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
                    Siguiente &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {postulacionVacante && (
        <PostulacionModal vacante={postulacionVacante} onClose={() => setPostulacionVacante(null)} />
      )}
    </>
  );
}

export default function VacantesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink-800 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-faena border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VacantesContent />
    </Suspense>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 bg-faena/20 border border-faena/40 text-faena-300 text-xs font-semibold rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-faena">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

function JobCard({ vacante, onPostular }: { vacante: Vacante; onPostular: () => void }) {
  const isReal = !vacante.id.startsWith('mock-');
  const dias = Math.floor((Date.now() - new Date(vacante.created_at).getTime()) / 86400000);

  return (
    <div className="card p-5 flex flex-col group hover:-translate-y-0.5 transition-transform duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="px-2.5 py-1 bg-faena/15 border border-faena/30 text-faena-300 text-xs font-semibold rounded-full">
          {vacante.equipo_requerido}
        </span>
        <span className="text-xs text-gray-600 flex-shrink-0">
          {dias === 0 ? 'Hoy' : `Hace ${dias}d`}
        </span>
      </div>

      <h3 className="text-base font-bold text-white group-hover:text-faena transition-colors mb-1 line-clamp-2">
        {vacante.titulo}
      </h3>
      {vacante.empresa && (
        <p className="text-xs text-gray-500 mb-3">{vacante.empresa.nombre}</p>
      )}

      <div className="space-y-1.5 mb-4 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {vacante.ciudad}, {vacante.region}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-faena-300 capitalize font-medium">{vacante.turno}</span>
          <span className="text-gray-500">{vacante.experiencia_minima}+ años</span>
        </div>
        {vacante.salario_min && (
          <p className="text-faena font-bold text-sm">
            ${Math.round(vacante.salario_min / 1000)}k &ndash; ${Math.round((vacante.salario_max || 0) / 1000)}k
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-ink-600">
        {isReal ? (
          <Link href={`/vacantes/${vacante.id}`} className="flex-1 btn-secondary text-xs text-center py-2">
            Ver más
          </Link>
        ) : (
          <span className="flex-1 py-2 text-xs text-center text-gray-600 bg-ink-600/40 rounded-lg">Ver más</span>
        )}
        <button onClick={onPostular} className="flex-1 btn-primary text-xs py-2">Postular</button>
      </div>
    </div>
  );
}
