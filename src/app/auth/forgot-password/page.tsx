'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ForgotPassword() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) throw resetError;

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email de recuperación');
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
            <h1 className="text-3xl font-bold text-white mb-2">¿Olvidaste tu contraseña?</h1>
            <p className="text-gray-400 mb-6">
              Ingresa tu email y te enviaremos un enlace para restablecerla.
            </p>

            {sent ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-sm">
                  Te enviamos un email a <strong>{email}</strong> con las instrucciones.
                  Revisa tu bandeja de entrada (y la carpeta de spam).
                </div>
                <Link href="/auth/login" className="btn-secondary w-full text-center inline-block">
                  Volver al login
                </Link>
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
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace'}
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
