'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function EmpresaDashboard() {
  const router = useRouter();
  const [empresa, setEmpresa] = useState<any>(null);
  const [vacantes, setVacantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/auth/login');
          return;
        }

        // Fetch empresa profile
        const { data: empresaData } = await supabase
          .from('empresas')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (empresaData) {
          setEmpresa(empresaData);

          // Fetch vacantes
          const { data: vacantesData } = await supabase
            .from('vacantes')
            .select('*')
            .eq('empresa_id', empresaData.id);

          setVacantes(vacantesData || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {empresa?.nombre}
              </h1>
              <p className="text-gray-400">{vacantes.length} vacantes publicadas</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              Cerrar sesión
            </button>
          </div>

          {/* Company Card */}
          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Información de la Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">RUT</p>
                <p className="text-white">{empresa?.rut}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Teléfono</p>
                <p className="text-white">{empresa?.telefono}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Región</p>
                <p className="text-white">{empresa?.region}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Ciudad</p>
                <p className="text-white">{empresa?.ciudad}</p>
              </div>
            </div>
            <Link href="#" className="btn-secondary mt-6 inline-block">
              Editar empresa
            </Link>
          </div>

          {/* Vacantes */}
          <div className="card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Mis Vacantes</h2>
              <Link href="/dashboard/empresa/nueva-vacante" className="btn-primary">
                + Nueva vacante
              </Link>
            </div>
            {vacantes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Aún no has publicado vacantes</p>
                <Link href="/dashboard/empresa/nueva-vacante" className="btn-primary">
                  Publicar primera vacante
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {vacantes.map((vacante) => (
                  <div key={vacante.id} className="border border-ink-600 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold">{vacante.titulo}</h3>
                      <p className="text-gray-400 text-sm">{vacante.equipo_requerido} • {vacante.region}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-ink-600 hover:bg-ink-700 rounded text-sm text-white transition-colors">
                        Ver postulantes
                      </button>
                      <button className="px-4 py-2 bg-ink-600 hover:bg-ink-700 rounded text-sm text-white transition-colors">
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
