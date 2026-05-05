'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function SetupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (searchParams.get('role') || 'operador') as 'operador' | 'empresa';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOperadorSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const user = (await supabase.auth.getUser()).data.user;

      if (!user) throw new Error('No user found');

      await supabase.from('operadores').insert({
        user_id: user.id,
        nombre_completo: formData.get('nombre_completo'),
        rut: formData.get('rut'),
        telefono: formData.get('telefono'),
        años_experiencia: parseInt(formData.get('años_experiencia') as string) || 0,
        region: formData.get('region'),
        ciudad: formData.get('ciudad'),
        disponible: true,
      });

      router.push('/dashboard/operador');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmpresaSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const user = (await supabase.auth.getUser()).data.user;

      if (!user) throw new Error('No user found');

      await supabase.from('empresas').insert({
        user_id: user.id,
        nombre: formData.get('nombre'),
        rut: formData.get('rut'),
        telefono: formData.get('telefono'),
        region: formData.get('region'),
        ciudad: formData.get('ciudad'),
      });

      router.push('/dashboard/empresa');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Completa tu perfil</h1>
      <p className="text-gray-400 mb-6">
        {role === 'operador' ? 'Información del operador' : 'Información de la empresa'}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {role === 'operador' ? (
        <form onSubmit={handleOperadorSetup} className="space-y-4">
          <input
            type="text"
            name="nombre_completo"
            placeholder="Nombre completo"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <input
            type="text"
            name="rut"
            placeholder="RUT"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <input
            type="number"
            name="años_experiencia"
            placeholder="Años de experiencia"
            min="0"
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <input
            type="text"
            name="region"
            placeholder="Región"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <input
            type="text"
            name="ciudad"
            placeholder="Ciudad"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleEmpresaSetup} className="space-y-4">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre de la empresa"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <input
            type="text"
            name="rut"
            placeholder="RUT"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <input
            type="text"
            name="region"
            placeholder="Región"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <input
            type="text"
            name="ciudad"
            placeholder="Ciudad"
            required
            className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
          />
          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function SetupProfileForm() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SetupForm />
    </Suspense>
  );
}
