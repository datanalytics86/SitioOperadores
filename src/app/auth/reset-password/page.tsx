'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ResetPassword() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('El enlace de recuperación es inválido o expiró. Solicita uno nuevo.');
      }
      setAuthChecked(true);
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setDone(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Nueva contraseña</h1>
            <p className="text-gray-400 mb-6">
              Crea una nueva contraseña para tu cuenta.
            </p>

            {!authChecked ? (
              <p className="text-gray-400 text-sm">Verificando enlace…</p>
            ) : done ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-sm">
                  Contraseña actualizada. Redirigiendo al login…
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
                      placeholder="Repite tu contraseña"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-6">
                  <Link href="/auth/login" className="text-faena-300 hover:text-faena transition-colors">
                    Volver al login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
