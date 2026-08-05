'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/lib/validations/auth';
import { dashboardPathForRole } from '@/lib/auth/roles';
import { checkAuthRateLimit } from '@/lib/auth/check-rate-limit';

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const rl = await checkAuthRateLimit('login');
      if (!rl.ok) throw new Error(rl.error || 'Demasiados intentos');

      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message || 'Datos inválidos');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        router.push(dashboardPathForRole(userData?.role));
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      // Mensaje genérico ante credenciales inválidas (no filtrar existencia de email)
      if (
        typeof message === 'string' &&
        (message.toLowerCase().includes('invalid') ||
          message.toLowerCase().includes('credentials'))
      ) {
        setError('Correo o contraseña incorrectos');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink-800 flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Inicia sesión</h1>
          <p className="text-gray-400 mb-6">Bienvenido a OperadoresFaena.cl</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-2"
                htmlFor="login-email"
              >
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-2"
                htmlFor="login-password"
              >
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
                placeholder="Tu contraseña"
              />
              <div className="mt-2 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-faena-300 hover:text-faena transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-gray-400 text-sm">¿No tienes cuenta?</p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/auth/signup?role=operador"
                className="btn-secondary text-center text-sm"
              >
                Soy Operador
              </Link>
              <Link
                href="/auth/signup?role=empresa"
                className="btn-secondary text-center text-sm"
              >
                Soy Empresa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
