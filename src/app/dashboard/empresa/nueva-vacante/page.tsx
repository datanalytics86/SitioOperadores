'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createVacanteAction } from '@/app/actions/vacantes';
import { EQUIPOS, REGIONES } from '@/lib/constants/chile';

export default function NuevaVacante() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    const payload = {
      titulo: formData.get('titulo'),
      descripcion: formData.get('descripcion'),
      equipo_requerido: formData.get('equipo_requerido'),
      experiencia_minima: formData.get('experiencia_minima') || 0,
      region: formData.get('region'),
      ciudad: formData.get('ciudad'),
      turno: formData.get('turno'),
      salario_min: formData.get('salario_min') || null,
      salario_max: formData.get('salario_max') || null,
      cantidad_vacantes: formData.get('cantidad_vacantes') || 1,
    };

    startTransition(async () => {
      const result = await createVacanteAction(payload);
      if (result.success === false) {
        setError(result.error);
        return;
      }
      router.push('/dashboard/empresa');
      router.refresh();
    });
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
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="titulo">
                    Título del puesto
                  </label>
                  <input
                    id="titulo"
                    type="text"
                    name="titulo"
                    required
                    minLength={5}
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                    placeholder="ej: Operador CAEX"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-300 mb-2"
                    htmlFor="equipo_requerido"
                  >
                    Equipo a operar
                  </label>
                  <select
                    id="equipo_requerido"
                    name="equipo_requerido"
                    required
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  >
                    <option value="">Seleccionar equipo</option>
                    {EQUIPOS.map((eq) => (
                      <option key={eq} value={eq}>
                        {eq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-2"
                  htmlFor="descripcion"
                >
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  required
                  minLength={20}
                  rows={5}
                  className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  placeholder="Describe el puesto, responsabilidades, beneficios, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-300 mb-2"
                    htmlFor="experiencia_minima"
                  >
                    Experiencia mínima (años)
                  </label>
                  <input
                    id="experiencia_minima"
                    type="number"
                    name="experiencia_minima"
                    min={0}
                    defaultValue={0}
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="turno">
                    Turno
                  </label>
                  <select
                    id="turno"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="region">
                    Región
                  </label>
                  <select
                    id="region"
                    name="region"
                    required
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  >
                    <option value="">Seleccionar</option>
                    {REGIONES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="ciudad">
                    Ciudad
                  </label>
                  <input
                    id="ciudad"
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
                  <label
                    className="block text-sm font-medium text-gray-300 mb-2"
                    htmlFor="salario_min"
                  >
                    Sueldo mínimo (CLP)
                  </label>
                  <input
                    id="salario_min"
                    type="number"
                    name="salario_min"
                    min={0}
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-300 mb-2"
                    htmlFor="salario_max"
                  >
                    Sueldo máximo (CLP)
                  </label>
                  <input
                    id="salario_max"
                    type="number"
                    name="salario_max"
                    min={0}
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-300 mb-2"
                    htmlFor="cantidad_vacantes"
                  >
                    Cantidad de vacantes
                  </label>
                  <input
                    id="cantidad_vacantes"
                    type="number"
                    name="cantidad_vacantes"
                    min={1}
                    defaultValue={1}
                    className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isPending ? 'Publicando...' : 'Publicar vacante'}
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
