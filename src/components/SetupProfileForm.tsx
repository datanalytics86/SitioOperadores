'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const LICENCIAS = ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E', 'F'];
const EQUIPOS = [
  'CAEX',
  'Cargador Frontal',
  'Retroexcavadora',
  'Bulldozer',
  'Camión Minero',
  'Excavadora',
  'Motoniveladora',
  'Rodillo Compactador',
  'Grúa',
  'Manipulador Telescópico',
  'Otro',
];
const CERTIFICACIONES = [
  'Curso Faena Minera',
  'Manejo Defensivo',
  'Trabajo en Altura',
  'Riesgos Específicos',
  'Primeros Auxilios',
  'IRATA',
  'OSHA',
];

const REGIONES = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
];

function ChipMultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  };
  return (
    <div>
      <p className="text-sm font-medium text-gray-300 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={
                active
                  ? 'px-3 py-1.5 rounded-full text-sm font-semibold border bg-faena/20 border-faena/60 text-faena-300'
                  : 'px-3 py-1.5 rounded-full text-sm border bg-ink-700 border-ink-600 text-gray-400 hover:border-faena/40'
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SetupForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (searchParams.get('role') || 'operador') as 'operador' | 'empresa';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [licencias, setLicencias] = useState<string[]>([]);
  const [equipos, setEquipos] = useState<string[]>([]);
  const [certificaciones, setCertificaciones] = useState<string[]>([]);

  const handleOperadorSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('No user found');

      if (equipos.length === 0) {
        throw new Error('Selecciona al menos un equipo que sepas operar');
      }

      const { error: insertError } = await supabase.from('operadores').insert({
        user_id: user.id,
        nombre_completo: formData.get('nombre_completo'),
        rut: formData.get('rut'),
        telefono: formData.get('telefono'),
        años_experiencia: parseInt(formData.get('años_experiencia') as string) || 0,
        region: formData.get('region'),
        ciudad: formData.get('ciudad'),
        licencias,
        equipos_operados: equipos,
        certificaciones,
        disponible: true,
      });

      if (insertError) throw insertError;

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

      const { error: insertError } = await supabase.from('empresas').insert({
        user_id: user.id,
        nombre: formData.get('nombre'),
        rut: formData.get('rut'),
        telefono: formData.get('telefono'),
        region: formData.get('region'),
        ciudad: formData.get('ciudad'),
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
        <form onSubmit={handleOperadorSetup} className="space-y-5">
          <div>
            <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre completo *
            </label>
            <input
              id="nombre_completo"
              type="text"
              name="nombre_completo"
              required
              className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rut" className="block text-sm font-medium text-gray-300 mb-2">
                RUT *
              </label>
              <input
                id="rut"
                type="text"
                name="rut"
                required
                placeholder="12.345.678-9"
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono *
              </label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                required
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="años_experiencia" className="block text-sm font-medium text-gray-300 mb-2">
                Años exp. *
              </label>
              <input
                id="años_experiencia"
                type="number"
                name="años_experiencia"
                min="0"
                required
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
              />
            </div>
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-300 mb-2">
                Región *
              </label>
              <select
                id="region"
                name="region"
                required
                defaultValue=""
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
              >
                <option value="" disabled>
                  Selecciona
                </option>
                {REGIONES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ciudad" className="block text-sm font-medium text-gray-300 mb-2">
                Ciudad *
              </label>
              <input
                id="ciudad"
                type="text"
                name="ciudad"
                required
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
              />
            </div>
          </div>

          <ChipMultiSelect
            label="Equipos que operas *"
            options={EQUIPOS}
            selected={equipos}
            onChange={setEquipos}
          />

          <ChipMultiSelect
            label="Licencias de conducir"
            options={LICENCIAS}
            selected={licencias}
            onChange={setLicencias}
          />

          <ChipMultiSelect
            label="Certificaciones"
            options={CERTIFICACIONES}
            selected={certificaciones}
            onChange={setCertificaciones}
          />

          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleEmpresaSetup} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la empresa *
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              required
              className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="empresa_rut" className="block text-sm font-medium text-gray-300 mb-2">
                RUT *
              </label>
              <input
                id="empresa_rut"
                type="text"
                name="rut"
                required
                placeholder="76.123.456-7"
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
              />
            </div>
            <div>
              <label htmlFor="empresa_telefono" className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono *
              </label>
              <input
                id="empresa_telefono"
                type="tel"
                name="telefono"
                required
                placeholder="+56 2 2123 4567"
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="empresa_region" className="block text-sm font-medium text-gray-300 mb-2">
                Región *
              </label>
              <select
                id="empresa_region"
                name="region"
                required
                defaultValue=""
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
              >
                <option value="" disabled>
                  Selecciona
                </option>
                {REGIONES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="empresa_ciudad" className="block text-sm font-medium text-gray-300 mb-2">
                Ciudad *
              </label>
              <input
                id="empresa_ciudad"
                type="text"
                name="ciudad"
                required
                className="w-full px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-faena"
              />
            </div>
          </div>

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
    <Suspense fallback={<div className="text-gray-400">Cargando...</div>}>
      <SetupForm />
    </Suspense>
  );
}
