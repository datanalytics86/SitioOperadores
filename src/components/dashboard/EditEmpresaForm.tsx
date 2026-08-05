'use client';

import { useState, useTransition } from 'react';
import { updateEmpresaPerfilAction } from '@/app/actions/perfil';
import { REGIONES } from '@/lib/constants/chile';

type Empresa = {
  nombre: string;
  telefono: string;
  region: string;
  ciudad: string;
  sitio_web?: string | null;
  descripcion?: string | null;
  rut?: string;
};

export function EditEmpresaForm({
  empresa,
  onSaved,
}: {
  empresa: Empresa;
  onSaved?: (next: Empresa) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="card p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white">Información de la Empresa</h2>
          <button type="button" onClick={() => setEditing(true)} className="btn-secondary text-sm">
            Editar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {empresa.rut && (
            <div>
              <p className="text-gray-400 text-sm mb-1">RUT</p>
              <p className="text-white">{empresa.rut}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-sm mb-1">Teléfono</p>
            <p className="text-white">{empresa.telefono}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Región</p>
            <p className="text-white">{empresa.region}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Ciudad</p>
            <p className="text-white">{empresa.ciudad}</p>
          </div>
          {empresa.sitio_web && (
            <div>
              <p className="text-gray-400 text-sm mb-1">Sitio web</p>
              <a
                href={empresa.sitio_web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-faena-300 hover:text-faena text-sm"
              >
                {empresa.sitio_web}
              </a>
            </div>
          )}
        </div>
        {empresa.descripcion && (
          <p className="text-gray-300 text-sm mt-6">{empresa.descripcion}</p>
        )}
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const payload = {
        nombre: String(fd.get('nombre') || ''),
        telefono: String(fd.get('telefono') || ''),
        region: String(fd.get('region') || ''),
        ciudad: String(fd.get('ciudad') || ''),
        sitio_web: String(fd.get('sitio_web') || '') || null,
        descripcion: String(fd.get('descripcion') || '') || null,
      };
      const result = await updateEmpresaPerfilAction(payload);
      if (result.success === false) {
        setError(result.error);
        return;
      }
      setEditing(false);
      onSaved?.({ ...empresa, ...payload });
    });
  };

  return (
    <div className="card p-8 mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Editar empresa</h2>
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              defaultValue={empresa.nombre}
              required
              className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="telefono">
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              defaultValue={empresa.telefono}
              required
              className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="region">
              Región
            </label>
            <select
              id="region"
              name="region"
              defaultValue={empresa.region}
              required
              className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm"
            >
              {REGIONES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="ciudad">
              Ciudad
            </label>
            <input
              id="ciudad"
              name="ciudad"
              defaultValue={empresa.ciudad}
              required
              className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="sitio_web">
              Sitio web
            </label>
            <input
              id="sitio_web"
              name="sitio_web"
              type="url"
              defaultValue={empresa.sitio_web || ''}
              placeholder="https://"
              className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              defaultValue={empresa.descripcion || ''}
              rows={3}
              className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
            {isPending ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
