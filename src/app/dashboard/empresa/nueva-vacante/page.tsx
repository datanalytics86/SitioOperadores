'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NuevaVacante() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found');

      // Get empresa
      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!empresa) throw new Error('Empresa not found');

      // Create vacante
      const { error: insertError } = await supabase
        .from('vacantes')
        .insert({
          empresa_id: empresa.id,
          titulo: formData.get('titulo'),
          descripcion: formData.get('descripcion'),
          equipo_requerido: formData.get('equipo_requerido'),
          experiencia_minima: parseInt(formData.get('experiencia_minima') as string) || 0,
          region: formData.get('region'),
          ciudad: formData.get('ciudad'),
          turno: formData.get('turno'),
          salario_min: formData.get('salario_min') ? parseInt(formData.get('salario_min') as string) : null,
          salario_max: formData.get('salario_max') ? parseInt(formData.get('salario_max') as string) : null,
          cantidad_vacantes: parseInt(formData.get('cantidad_vacantes') as string) || 1,
          activa: true,
        });

      if (insertError) throw insertError;

      router.push('/dashboard/empresa');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Publicar nueva vacante</h1>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título del puesto
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    required
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                    placeholder="ej: Operador CAEX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Equipo a operar
                  </label>
                  <select
                    name="equipo_requerido"
                    required
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  >
                    <option value="">Seleccionar equipo</option>
                    <option value="CAEX">CAEX</option>
                    <option value="Cargador Frontal">Cargador Frontal</option>
                    <option value="Retroexcavadora">Retroexcavadora</option>
                    <option value="Camión Minero">Camión Minero</option>
                    <option value="Excavadora">Excavadora</option>
                    <option value="Bulldozer">Bulldozer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  required
                  rows={5}
                  className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  placeholder="Describe el puesto, responsabilidades, etc."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experiencia mínima (años)
                  </label>
                  <input
                    type="number"
                    name="experiencia_minima"
                    min="0"
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Turno
                  </label>
                  <select
                    name="turno"
                    required
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  >
                    <option value="mañana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                    <option value="rotativo">Rotativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Región
                  </label>
                  <input
                    type="text"
                    name="region"
                    required
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                    placeholder="ej: Atacama"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    required
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                    placeholder="ej: Copiapó"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sueldo mínimo (CLP)
                  </label>
                  <input
                    type="number"
                    name="salario_min"
                    min="0"
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sueldo máximo (CLP)
                  </label>
                  <input
                    type="number"
                    name="salario_max"
                    min="0"
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cantidad de vacantes
                  </label>
                  <input
                    type="number"
                    name="cantidad_vacantes"
                    min="1"
                    defaultValue="1"
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? 'Publicando...' : 'Publicar vacante'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
