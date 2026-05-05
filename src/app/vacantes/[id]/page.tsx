'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Vacante } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function VacantePage() {
  const supabase = createClient();
  const params = useParams();
  const [vacante, setVacante] = useState<Vacante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVacante = async () => {
      try {
        const { data } = await supabase
          .from('vacantes')
          .select('*, empresas(nombre, logo_url, descripcion)')
          .eq('id', params.id)
          .maybeSingle();

        setVacante(data);
      } catch (error) {
        console.error('Error fetching vacante:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVacante();
  }, [params.id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-ink-800 pt-20 flex items-center justify-center">
          <p className="text-gray-400">Cargando...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!vacante) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-ink-800 pt-20 flex items-center justify-center">
          <p className="text-gray-400">Vacante no encontrada</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <p className="section-label mb-2">{vacante.equipo_requerido}</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{vacante.titulo}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-gray-400 mb-4 sm:mb-0">
                <p>{vacante.empresa?.nombre}</p>
                <p>{vacante.ciudad}, {vacante.region}</p>
              </div>
              <Link href="/auth/login" className="btn-primary">
                Postular ahora
              </Link>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card p-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Turno</p>
              <p className="text-2xl font-bold text-faena capitalize">{vacante.turno}</p>
            </div>
            <div className="card p-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Experiencia</p>
              <p className="text-2xl font-bold text-faena">{vacante.experiencia_minima}+ años</p>
            </div>
            {vacante.salario_min && (
              <div className="card p-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Sueldo</p>
                <p className="text-2xl font-bold text-faena">
                  ${(vacante.salario_min / 1000).toFixed(0)}k - ${(vacante.salario_max ? vacante.salario_max / 1000 : 0).toFixed(0)}k
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Descripción</h2>
            <p className="text-gray-300 leading-relaxed">{vacante.descripcion}</p>
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Licencias Requeridas</h3>
              <ul className="space-y-2">
                {vacante.licencias_requeridas.length > 0 ? (
                  vacante.licencias_requeridas.map((lic) => (
                    <li key={lic} className="text-faena-300 flex items-center">
                      <span className="w-2 h-2 bg-faena rounded-full mr-2"></span>
                      {lic}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400">Sin requerimientos específicos</li>
                )}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Certificaciones</h3>
              <ul className="space-y-2">
                {vacante.certificaciones_requeridas.length > 0 ? (
                  vacante.certificaciones_requeridas.map((cert) => (
                    <li key={cert} className="text-faena-300 flex items-center">
                      <span className="w-2 h-2 bg-faena rounded-full mr-2"></span>
                      {cert}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400">Sin requerimientos específicos</li>
                )}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/auth/login" className="btn-primary inline-block">
              Postular a esta vacante
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
