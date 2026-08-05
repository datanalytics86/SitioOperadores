import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getVacantes } from '@/lib/data/vacantes';
import { VacanteJobCard } from '@/components/vacantes/VacanteJobCard';
import { VacantesFilters } from '@/components/vacantes/VacantesFilters';
import { Pagination } from '@/components/vacantes/Pagination';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Vacantes para operadores de maquinaria | OperadoresFaena.cl',
  description:
    'Busca empleos de operador CAEX, cargador frontal, retroexcavadora y más en todo Chile.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function VacantesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const equipo = typeof sp.equipo === 'string' ? sp.equipo : undefined;
  const region = typeof sp.region === 'string' ? sp.region : undefined;
  const turno = typeof sp.turno === 'string' ? sp.turno : undefined;
  const q = typeof sp.q === 'string' ? sp.q : undefined;
  const soloSalario = sp.salario === '1';
  const page = Math.max(1, parseInt(typeof sp.page === 'string' ? sp.page : '1', 10) || 1);
  const PAGE_SIZE = 9;

  const { data: vacantes, total, fromMock } = await getVacantes({
    equipo,
    region,
    turno,
    q,
    soloSalario,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filterParams = {
    equipo,
    region,
    turno,
    q,
    salario: soloSalario ? '1' : undefined,
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-16">
        <div className="bg-ink-700 border-b border-ink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="section-label mb-2">
              Chile · {total} empleo{total !== 1 ? 's' : ''}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Empleos para Operadores
            </h1>
            {fromMock && (
              <p className="text-xs text-amber-400/90 mt-2">
                Mostrando datos de demostración (mocks). Configura vacantes reales en
                Supabase o desactiva con NEXT_PUBLIC_USE_MOCKS=false.
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-52 flex-shrink-0">
              <Suspense fallback={<div className="text-gray-500 text-sm">Cargando filtros…</div>}>
                <VacantesFilters variant="sidebar" />
              </Suspense>
            </aside>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-400 mb-5">
                {total} empleo{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </p>

              {vacantes.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">No hay empleos con esos filtros.</p>
                  <Link href="/vacantes" className="btn-secondary text-sm">
                    Limpiar filtros
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {vacantes.map((v) => (
                    <VacanteJobCard key={v.id} vacante={v} compact />
                  ))}
                </div>
              )}

              <Pagination
                page={page}
                totalPages={totalPages}
                basePath="/vacantes"
                searchParams={filterParams}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
