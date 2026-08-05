'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Stats = {
  users: number;
  operadores: number;
  empresas: number;
  vacantes: number;
  postulaciones: number;
};

/**
 * Admin dashboard básico.
 * Acceso: users.role = 'admin' (middleware + layout + client check).
 * Promoción a admin: solo vía SQL service_role (trigger prevent_role_escalation).
 */
export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data: row } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (row?.role !== 'admin') {
          router.push('/');
          return;
        }

        const [u, o, e, v, p] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('operadores').select('id', { count: 'exact', head: true }),
          supabase.from('empresas').select('id', { count: 'exact', head: true }),
          supabase.from('vacantes').select('id', { count: 'exact', head: true }),
          supabase.from('postulaciones').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          users: u.count ?? 0,
          operadores: o.count ?? 0,
          empresas: e.count ?? 0,
          vacantes: v.count ?? 0,
          postulaciones: p.count ?? 0,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-ink-800 pt-20 flex items-center justify-center">
          <p className="text-gray-400">Cargando admin…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="section-label mb-1">Administración</p>
              <h1 className="text-3xl font-bold text-white">Panel Admin</h1>
            </div>
            <Link href="/" className="btn-secondary text-sm">
              Ir al sitio
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {[
              { label: 'Usuarios', value: stats?.users },
              { label: 'Operadores', value: stats?.operadores },
              { label: 'Empresas', value: stats?.empresas },
              { label: 'Vacantes', value: stats?.vacantes },
              { label: 'Postulaciones', value: stats?.postulaciones },
            ].map((s) => (
              <div key={s.label} className="card p-5 text-center">
                <p className="text-3xl font-bold text-faena">{s.value ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card p-6 text-sm text-gray-400 space-y-2">
            <h2 className="text-white font-semibold mb-2">Acciones admin (próximas)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Moderar vacantes reportadas</li>
              <li>Suspender usuarios</li>
              <li>Impersonación read-only (audit log)</li>
              <li>Export CSV de métricas</li>
            </ul>
            <p className="pt-3 text-xs text-gray-600">
              Para promover un admin: SQL con service_role — el trigger{' '}
              <code className="text-faena-300">prevent_role_escalation</code> bloquea auto-promoción.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
