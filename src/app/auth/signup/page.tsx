'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PASSWORD_HINT,
  signUpSchema,
  validatePassword,
} from '@/lib/validations/auth';
import { checkAuthRateLimit } from '@/lib/auth/check-rate-limit';

function SignUpContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') || 'operador') as 'operador' | 'empresa';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const rl = await checkAuthRateLimit('signup');
      if (!rl.ok) throw new Error(rl.error || 'Demasiados intentos');

      const parsed = signUpSchema.safeParse({ email, password, role });
      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message || 'Datos inválidos');
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { role: parsed.data.role },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // El trigger on_auth_user_created (migración 008) crea la fila en
        // public.users automáticamente leyendo el rol desde raw_user_meta_data.
        router.push(`/auth/setup-profile?role=${parsed.data.role}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const passwordHint = password ? validatePassword(password) : null;

  return (
    <div className="card p-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        {role === 'operador' ? 'Soy Operador' : 'Soy Empresa'}
      </h1>
      <p className="text-gray-400 mb-6">Crea tu cuenta en OperadoresFaena.cl</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-email">
            Correo electrónico
          </label>
          <input
            id="signup-email"
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
          <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-password">
            Contraseña
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
            placeholder={PASSWORD_HINT}
            aria-describedby="password-requirements"
          />
          <p
            id="password-requirements"
            className={`mt-1.5 text-xs ${passwordHint ? 'text-amber-400' : 'text-gray-500'}`}
          >
            {passwordHint || PASSWORD_HINT}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login" className="text-faena-300 hover:text-faena transition-colors">
          Inicia sesión
        </Link>
      </p>

      <div className="mt-4 text-center">
        <Link
          href={role === 'operador' ? '/auth/signup?role=empresa' : '/auth/signup?role=operador'}
          className="text-sm text-gray-500 hover:text-faena-300 transition-colors"
        >
          {role === 'operador' ? '¿Eres empresa? Regístrate aquí' : '¿Eres operador? Regístrate aquí'}
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-ink-800 flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="card p-8">
              <p className="text-gray-400">Cargando...</p>
            </div>
          }
        >
          <SignUpContent />
        </Suspense>
      </div>
    </main>
  );
}
