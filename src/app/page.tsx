'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostulacionModal from '@/components/PostulacionModal';
import StatsSection from '@/components/StatsSection';
import { supabase } from '@/lib/supabase';

const EQUIPOS = ['Todos', 'CAEX', 'Cargador Frontal', 'Retroexcavadora', 'Camión Minero', 'Excavadora', 'Bulldozer'];
const REGIONES = ['Todas', 'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'];
const TURNOS = ['Todos', 'mañana', 'tarde', 'noche', 'rotativo'];

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
  empresa?: { nombre: string; logo_url?: string };
  created_at: string;
}

const VACANTES_MOCK: Vacante[] = [
  { id: 'mock-1', titulo: 'Operador CAEX — Faena Norte', descripcion: 'Se busca operador CAEX con experiencia mínima 5 años para faena en Atacama. Turno 14x7 con traslado incluido.', equipo_requerido: 'CAEX', region: 'Atacama', ciudad: 'Copiapó', turno: 'rotativo', salario_min: 3200000, salario_max: 4000000, cantidad_vacantes: 2, experiencia_minima: 5, empresa: { nombre: 'Minera Atacama S.A.' }, created_at: new Date().toISOString() },
  { id: 'mock-2', titulo: 'Cargador Frontal Turno Día', descripcion: 'Buscamos operador cargador frontal con licencia D para trabajo en construcción residencial. Contrato indefinido.', equipo_requerido: 'Cargador Frontal', region: 'Metropolitana', ciudad: 'Santiago', turno: 'mañana', salario_min: 2500000, salario_max: 3200000, cantidad_vacantes: 1, experiencia_minima: 2, empresa: { nombre: 'Constructora XYZ' }, created_at: new Date().toISOString() },
  { id: 'mock-3', titulo: 'Retroexcavadora Urgente', descripcion: 'Puesto urgente para retroexcavadora en proyecto de infraestructura vial. Experiencia en carreteras requerida.', equipo_requerido: 'Retroexcavadora', region: 'Valparaíso', ciudad: 'Viña del Mar', turno: 'tarde', salario_min: 2000000, salario_max: 2800000, cantidad_vacantes: 3, experiencia_minima: 1, empresa: { nombre: 'Infraestructuras Chile' }, created_at: new Date().toISOString() },
  { id: 'mock-4', titulo: 'Operador Camión Minero', descripcion: 'Gran oportunidad en faena minera de cobre. Turno 7x7, alojamiento y alimentación incluida.', equipo_requerido: 'Camión Minero', region: 'Antofagasta', ciudad: 'Calama', turno: 'rotativo', salario_min: 2800000, salario_max: 3500000, cantidad_vacantes: 4, experiencia_minima: 3, empresa: { nombre: 'Codelco Norte' }, created_at: new Date().toISOString() },
  { id: 'mock-5', titulo: 'Excavadora Proyecto Portuario', descripcion: 'Proyecto portuario en región de Los Lagos. Se busca operador con experiencia en obras marítimas.', equipo_requerido: 'Excavadora', region: 'Los Lagos', ciudad: 'Puerto Montt', turno: 'mañana', salario_min: 2200000, salario_max: 2900000, cantidad_vacantes: 2, experiencia_minima: 2, empresa: { nombre: 'Puerto Sur S.A.' }, created_at: new Date().toISOString() },
  { id: 'mock-6', titulo: 'Bulldozer Minería del Carbón', descripcion: 'Se requiere operador de bulldozer para operaciones en mina de carbón, Biobío. Turno rotativo.', equipo_requerido: 'Bulldozer', region: 'Biobío', ciudad: 'Coronel', turno: 'noche', salario_min: 2400000, salario_max: 3100000, cantidad_vacantes: 1, experiencia_minima: 4, empresa: { nombre: 'Carbón Sur Ltda.' }, created_at: new Date().toISOString() },
];

export default function Home() {
  const [vacantes, setVacantes] = useState<Vacante[]>(VACANTES_MOCK);
  const [filteredVacantes, setFilteredVacantes] = useState<Vacante[]>(VACANTES_MOCK);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(VACANTES_MOCK.length);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [equipo, setEquipo] = useState('Todos');
  const [region, setRegion] = useState('Todas');
  const [turno, setTurno] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const [postulacionVacante, setPostulacionVacante] = useState<Vacante | null>(null);

  const fetchVacantes = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vacantes')
        .select('*, empresa:empresas(nombre, logo_url)', { count: 'exact' })
        .eq('activa', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (equipo !== 'Todos') query = query.eq('equipo_requerido', equipo);
      if (region !== 'Todas') query = query.eq('region', region);
      if (turno !== 'Todos') query = query.eq('turno', turno);
      if (busqueda) query = query.ilike('titulo', `%${busqueda}%`);

      const { data, count } = await query;

      if (data && data.length > 0) {
        setVacantes(data);
        setFilteredVacantes(data);
        setTotal(count || 0);
      } else {
        // Fallback to mock data with client-side filter
        let filtered = VACANTES_MOCK;
        if (equipo !== 'Todos') filtered = filtered.filter(v => v.equipo_requerido === equipo);
        if (region !== 'Todas') filtered = filtered.filter(v => v.region === region);
        if (turno !== 'Todos') filtered = filtered.filter(v => v.turno === turno);
        if (busqueda) filtered = filtered.filter(v => v.titulo.toLowerCase().includes(busqueda.toLowerCase()));
        setVacantes(filtered);
        setFilteredVacantes(filtered);
        setTotal(filtered.length);
      }
    } catch {
      // On error use mock data
      setVacantes(VACANTES_MOCK);
      setFilteredVacantes(VACANTES_MOCK);
    } finally {
      setLoading(false);
    }
  }, [equipo, region, turno, busqueda, page]);

  useEffect(() => {
    fetchVacantes();
  }, [fetchVacantes]);

  const handleFilter = () => {
    setPage(1);
    fetchVacantes();
  };

  return (
    <main className="bg-ink-800 min-h-screen">
      <Navbar />

      {/* HERO */}
      <section id="inicio" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=80"
            alt="Maquinaria pesada minería Chile"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/92 via-ink-800/75 to-ink-900/85" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-3xl">
            <p className="section-label mb-4">La plataforma #1 en Chile</p>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display text-faena leading-none mb-6">
              Operadores<br />
              <span className="text-white">Faena.cl</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-6 leading-relaxed max-w-2xl">
              La mejor forma de encontrar o conseguir trabajo como operador de maquinaria en Chile.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {['CAEX', 'Cargador Frontal', 'Retroexcavadora', 'Camiones'].map((eq) => (
                <span key={eq} className="px-4 py-1.5 bg-faena/15 border border-faena/40 text-faena-300 text-sm font-semibold rounded-full">
                  {eq}
                </span>
              ))}
            </div>

            {/* Hero search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <input
                type="text"
                placeholder="¿Qué equipo operas o qué cargo buscas?"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                className="flex-1 px-5 py-4 bg-ink-700/80 border border-ink-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-faena text-base"
              />
              <button onClick={handleFilter} className="btn-primary whitespace-nowrap px-8 py-4 text-base">
                Buscar Empleos
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <a href="#empleos" className="btn-primary text-center">
                Ver empleos disponibles
              </a>
              <Link href="/auth/signup?role=empresa" className="btn-secondary text-center">
                Publicar oferta gratis
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              {[
                { value: '+1.800', label: 'Operadores' },
                { value: `${total > 0 ? total : '420'}`, label: 'Vacantes activas' },
                { value: '96%', label: 'Satisfacción' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl sm:text-4xl font-bold text-faena">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-faena/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* FILTROS + EMPLEOS */}
      <section id="empleos" className="py-20 bg-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-10">
            <p className="section-label mb-2">Oportunidades en Chile</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Busca tu próximo empleo
            </h2>
          </div>

          {/* Filters */}
          <div className="bg-ink-700 rounded-xl border border-ink-600 p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Equipo</label>
                <select
                  value={equipo}
                  onChange={(e) => setEquipo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena text-sm"
                >
                  {EQUIPOS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Región</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena text-sm"
                >
                  {REGIONES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Turno</label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="w-full px-4 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena text-sm"
                >
                  {TURNOS.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Buscar</label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Título del cargo..."
                  className="w-full px-4 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-faena text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Mostrando <span className="text-faena font-semibold">{filteredVacantes.length}</span> empleos
                {total > filteredVacantes.length && ` de ${total}`}
              </p>
              <button onClick={handleFilter} className="btn-primary text-sm px-6 py-2">
                Filtrar empleos
              </button>
            </div>
          </div>

          {/* Vacantes Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-3 bg-ink-600 rounded w-1/3 mb-3"></div>
                  <div className="h-5 bg-ink-600 rounded w-2/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-ink-600 rounded"></div>
                    <div className="h-3 bg-ink-600 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVacantes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">No se encontraron empleos con esos filtros.</p>
              <button onClick={() => { setEquipo('Todos'); setRegion('Todas'); setTurno('Todos'); setBusqueda(''); }} className="btn-secondary">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVacantes.map((vacante) => (
                <VacanteCardLanding
                  key={vacante.id}
                  vacante={vacante}
                  onPostular={() => setPostulacionVacante(vacante)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex justify-center gap-3 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-6 py-2 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="flex items-center text-gray-400 text-sm">
                Página {page} de {Math.ceil(total / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
                className="btn-secondary px-6 py-2 text-sm disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 bg-ink-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Proceso simple</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Cómo funciona</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-xl font-bold text-faena mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-faena rounded-full flex items-center justify-center text-black text-sm font-bold">O</span>
                Para Operadores
              </h3>
              <div className="space-y-6">
                {[
                  { num: '1', title: 'Regístrate gratis', desc: 'Crea tu perfil en menos de 2 minutos con tu información y experiencia.' },
                  { num: '2', title: 'Filtra empleos', desc: 'Busca por equipo, región, turno y salario. Sin ruido de perfiles no especializados.' },
                  { num: '3', title: 'Postula en un click', desc: 'Envía tu CV y datos directamente. La empresa te contacta si hay match.' },
                  { num: '4', title: 'Consigue el turno', desc: 'Coordinación directa. Sin intermediarios innecesarios.' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-faena text-black font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup?role=operador" className="btn-primary inline-block mt-8">
                Crear perfil gratis
              </Link>
            </div>

            <div>
              <h3 className="text-xl font-bold text-faena mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-faena rounded-full flex items-center justify-center text-black text-sm font-bold">E</span>
                Para Empresas
              </h3>
              <div className="space-y-6">
                {[
                  { num: '1', title: 'Publica tu aviso', desc: 'Describe el puesto con detalle: equipo, turno, región, salario y requisitos.' },
                  { num: '2', title: 'Recibe postulaciones', desc: 'Solo operadores calificados y especializados aplican a tu vacante.' },
                  { num: '3', title: 'Revisa candidatos', desc: 'Accede a perfiles completos con CV, certificaciones y experiencia.' },
                  { num: '4', title: 'Contrata al mejor', desc: 'Contacto directo con el operador ideal. Sin comisiones ocultas.' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-faena text-black font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup?role=empresa" className="btn-primary inline-block mt-8">
                Publicar vacante hoy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-20 bg-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Lo que dicen de nosotros</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Historias reales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { nombre: 'Carlos Fuentes', rol: 'Operador CAEX, Atacama', imagen: 'https://images.unsplash.com/photo-1542178243-bc20204b769f?auto=format&fit=crop&w=150&q=80', texto: 'Encontré trabajo en menos de una semana. Los filtros son exactos, no pierdo tiempo con avisos que no me corresponden.', empresa: 'Faena Atacama' },
              { nombre: 'Pamela Ríos', rol: 'Cargador Frontal, Valparaíso', imagen: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80', texto: 'Primera plataforma que entiende el rubro. El turno rotativo y el salario visible me ahorraron muchas llamadas inútiles.', empresa: 'Constructora Sur' },
              { nombre: 'Andrés Morales', rol: 'Camión Minero, Antofagasta', imagen: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', texto: 'Mi empresa encontró 3 operadores calificados en 48 horas. Imposible lograrlo en Laborum o Bumeran.', empresa: 'Minera Norte Ltda.' },
            ].map((testimonio) => (
              <div key={testimonio.nombre} className="card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonio.imagen}
                    alt={testimonio.nombre}
                    width={52}
                    height={52}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonio.nombre}</p>
                    <p className="text-sm text-faena-300">{testimonio.rol}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">"{testimonio.texto}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <StatsSection />

      {/* CTA EMPRESAS */}
      <section id="empresas" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80"
            alt="Maquinaria minera Chile"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink-900/85" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-4">Para empresas</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            ¿Necesitas operadores calificados <span className="text-faena">ya?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Publica tu aviso gratis y recibe postulaciones de operadores certificados en menos de 24 horas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=empresa" className="btn-primary text-lg px-10 py-4">
              Publicar aviso hoy
            </Link>
            <a href="#como-funciona" className="btn-secondary text-lg px-10 py-4">
              Ver cómo funciona
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* POSTULACION MODAL */}
      {postulacionVacante && (
        <PostulacionModal
          vacante={postulacionVacante}
          onClose={() => setPostulacionVacante(null)}
        />
      )}
    </main>
  );
}

function VacanteCardLanding({ vacante, onPostular }: { vacante: Vacante; onPostular: () => void }) {
  const isReal = !vacante.id.startsWith('mock-');

  return (
    <div className="card p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-200">
      <div className="mb-4">
        <p className="section-label mb-2">{vacante.equipo_requerido}</p>
        <h3 className="text-lg font-bold text-white group-hover:text-faena transition-colors mb-1 line-clamp-1">
          {vacante.titulo}
        </h3>
        {vacante.empresa && (
          <p className="text-sm text-gray-500">{vacante.empresa.nombre}</p>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">{vacante.descripcion}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {vacante.ciudad}, {vacante.region}
          </span>
          <span className="text-faena-300 capitalize font-medium">{vacante.turno}</span>
        </div>
        {vacante.salario_min && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Sueldo</span>
            <span className="text-faena font-bold">
              ${Math.round(vacante.salario_min / 1000)}k – ${Math.round((vacante.salario_max || 0) / 1000)}k
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Experiencia</span>
          <span className="text-white">{vacante.experiencia_minima}+ años</span>
        </div>
      </div>

      <div className="pt-4 border-t border-ink-600 flex gap-2">
        {isReal ? (
          <Link href={`/vacantes/${vacante.id}`} className="flex-1 btn-secondary text-sm text-center py-2">
            Ver detalles
          </Link>
        ) : (
          <span className="flex-1 py-2 text-sm text-center text-gray-500 bg-ink-600 rounded-lg">Ver detalles</span>
        )}
        <button
          onClick={onPostular}
          className="flex-1 btn-primary text-sm py-2"
        >
          Postular
        </button>
      </div>
    </div>
  );
}
