'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OperadorDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [operador, setOperador] = useState<any>(null);
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/auth/login');
          return;
        }

        // Fetch operador profile
        const { data: operadorData } = await supabase
          .from('operadores')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (operadorData) {
          setOperador(operadorData);

          // Fetch postulaciones
          const { data: postulacionesData } = await supabase
            .from('postulaciones')
            .select('*, vacantes(titulo, empresa_id, empresas(nombre))')
            .eq('operador_id', operadorData.id);

          setPostulaciones(postulacionesData || []);
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
                Bienvenido, {operador?.nombre_completo}
              </h1>
              <p className="text-gray-400">{operador?.años_experiencia} años de experiencia</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              Cerrar sesión
            </button>
          </div>

          {/* Profile Card */}
          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Mi Perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">RUT</p>
                <p className="text-white">{operador?.rut}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Teléfono</p>
                <p className="text-white">{operador?.telefono}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Región</p>
                <p className="text-white">{operador?.region}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Ciudad</p>
                <p className="text-white">{operador?.ciudad}</p>
              </div>
            </div>
            <Link href="#" className="btn-secondary mt-6 inline-block">
              Editar perfil
            </Link>
          </div>

          {/* Postulaciones */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Mis Postulaciones</h2>
            {postulaciones.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Aún no tienes postulaciones</p>
                <Link href="/#empleos" className="btn-primary">
                  Ver empleos disponibles
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {postulaciones.map((post) => (
                  <div key={post.id} className="border border-ink-600 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold">{post.vacantes?.titulo}</h3>
                      <p className="text-gray-400 text-sm">{post.vacantes?.empresas?.nombre}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      post.estado === 'aceptado' ? 'bg-green-500/20 text-green-300' :
                      post.estado === 'rechazado' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {post.estado.charAt(0).toUpperCase() + post.estado.slice(1)}
                    </span>
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
