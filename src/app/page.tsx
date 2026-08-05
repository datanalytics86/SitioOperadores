import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatsSection from '@/components/StatsSection';
import { getVacantes } from '@/lib/data/vacantes';
import { VacanteJobCard } from '@/components/vacantes/VacanteJobCard';
import { VacantesFilters } from '@/components/vacantes/VacantesFilters';
import { HeroSearch } from '@/components/vacantes/HeroSearch';
import { Suspense } from 'react';

export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const equipo = typeof sp.equipo === 'string' ? sp.equipo : undefined;
  const region = typeof sp.region === 'string' ? sp.region : undefined;
  const turno = typeof sp.turno === 'string' ? sp.turno : undefined;
  const q = typeof sp.q === 'string' ? sp.q : undefined;
  const page = Math.max(1, parseInt(typeof sp.page === 'string' ? sp.page : '1', 10) || 1);
  const PAGE_SIZE = 6;

  const { data: vacantes, total, fromMock } = await getVacantes({
    equipo,
    region,
    turno,
    q,
    page,
    pageSize: PAGE_SIZE,
  });

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
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/92 via-ink-800/75 to-ink-900/85" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-3xl">
            <p className="section-label mb-4">La plataforma #1 en Chile</p>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display text-faena leading-none mb-6">
              Operadores
              <br />
              <span className="text-white">Faena.cl</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-6 leading-relaxed max-w-2xl">
              La mejor forma de encontrar o conseguir trabajo como operador de maquinaria en
              Chile.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {['CAEX', 'Cargador Frontal', 'Retroexcavadora', 'Camiones'].map((eq) => (
                <span
                  key={eq}
                  className="px-4 py-1.5 bg-faena/15 border border-faena/40 text-faena-300 text-sm font-semibold rounded-full"
                >
                  {eq}
                </span>
              ))}
            </div>

            <HeroSearch initialQ={q} />

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <a href="#empleos" className="btn-primary text-center">
                Ver empleos disponibles
              </a>
              <Link href="/auth/signup?role=empresa" className="btn-secondary text-center">
                Publicar oferta gratis
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              {[
                { value: '+1.800', label: 'Operadores' },
                { value: `${total > 0 ? total : '—'}`, label: 'Vacantes activas' },
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden>
          <svg className="w-6 h-6 text-faena/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* EMPLEOS — Server-rendered */}
      <section id="empleos" className="py-20 bg-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-label mb-2">Oportunidades en Chile</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Busca tu próximo empleo
            </h2>
            {fromMock && (
              <p className="text-xs text-amber-400/90">
                Datos de demostración (solo desarrollo / flag mocks).
              </p>
            )}
          </div>

          <Suspense
            fallback={
              <div className="h-24 bg-ink-700 rounded-xl animate-pulse mb-8" />
            }
          >
            <VacantesFilters variant="inline" />
          </Suspense>

          <p className="text-sm text-gray-400 mb-6">
            Mostrando{' '}
            <span className="text-faena font-semibold">{vacantes.length}</span>
            {total > vacantes.length && ` de ${total}`} empleos
          </p>

          {vacantes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">
                No se encontraron empleos con esos filtros.
              </p>
              <Link href="/" className="btn-secondary">
                Limpiar filtros
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vacantes.map((vacante) => (
                <VacanteJobCard key={vacante.id} vacante={vacante} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/vacantes" className="btn-primary px-10 py-3">
              Ver todos los empleos
            </Link>
          </div>
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
                <span className="w-8 h-8 bg-faena rounded-full flex items-center justify-center text-black text-sm font-bold">
                  O
                </span>
                Para Operadores
              </h3>
              <div className="space-y-6">
                {[
                  {
                    num: '1',
                    title: 'Regístrate gratis',
                    desc: 'Crea tu perfil en menos de 2 minutos con tu información y experiencia.',
                  },
                  {
                    num: '2',
                    title: 'Filtra empleos',
                    desc: 'Busca por equipo, región, turno y salario. Sin ruido de perfiles no especializados.',
                  },
                  {
                    num: '3',
                    title: 'Postula en un click',
                    desc: 'Envía tu CV y datos directamente. La empresa te contacta si hay match.',
                  },
                  {
                    num: '4',
                    title: 'Consigue el turno',
                    desc: 'Coordinación directa. Sin intermediarios innecesarios.',
                  },
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
                <span className="w-8 h-8 bg-faena rounded-full flex items-center justify-center text-black text-sm font-bold">
                  E
                </span>
                Para Empresas
              </h3>
              <div className="space-y-6">
                {[
                  {
                    num: '1',
                    title: 'Publica tu vacante',
                    desc: 'Describe el equipo, turno, región y requisitos. En menos de 3 minutos.',
                  },
                  {
                    num: '2',
                    title: 'Recibe postulaciones',
                    desc: 'Operadores calificados postulan con CV y experiencia verificable.',
                  },
                  {
                    num: '3',
                    title: 'Gestiona candidatos',
                    desc: 'Revisa, marca como visto, acepta o rechaza desde tu dashboard.',
                  },
                  {
                    num: '4',
                    title: 'Contrata más rápido',
                    desc: 'Contacto directo y chat. Menos tiempo de vacante abierta.',
                  },
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
                Publicar vacante
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-20 bg-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Confianza real</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Lo que dicen de nosotros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                nombre: 'Carlos Muñoz',
                rol: 'Operador CAEX · Atacama',
                texto:
                  'Encontré turno 14x7 en menos de una semana. El proceso es simple y las empresas responden rápido.',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
              },
              {
                nombre: 'María Soto',
                rol: 'RR.HH. · Constructora del Norte',
                texto:
                  'Publicamos 3 vacantes y en 48 horas teníamos postulantes con la experiencia exacta que buscábamos.',
                img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
              },
              {
                nombre: 'Jorge Peña',
                rol: 'Operador Retro · Valparaíso',
                texto:
                  'Antes mandaba CV a ciegas. Acá filtro por equipo y región y postulo en un click. Cambio total.',
                img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
              },
            ].map((testimonio) => (
              <div key={testimonio.nombre} className="card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonio.img}
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
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  &ldquo;{testimonio.texto}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatsSection />

      {/* CTA EMPRESAS */}
      <section id="empresas" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80"
            alt="Maquinaria minera Chile"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-ink-900/85" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-4">Para empresas</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            ¿Necesitas operadores calificados <span className="text-faena">ya?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Publica tu aviso gratis y recibe postulaciones de operadores certificados en menos
            de 24 horas.
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
    </main>
  );
}
