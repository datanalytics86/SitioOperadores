'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // El trigger on_auth_user_created (migración 008) crea la fila en
        // public.users automáticamente leyendo el rol desde raw_user_meta_data.
        // No hacemos INSERT manual: causaría duplicate key error.
        router.push(`/auth/setup-profile?role=${role}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contraseña
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
    </div>
  );
}

export default function SignUp() {
  return (
    <>
      <main className="min-h-screen bg-ink-800 flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <Suspense fallback={<div>Cargando...</div>}>
            <SignUpContent />
          </Suspense>
        </div>
      </main>
    </>
  );
}
