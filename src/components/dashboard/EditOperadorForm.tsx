'use client';

import { useState, useTransition } from 'react';
import { updateOperadorPerfilAction } from '@/app/actions/perfil';
import {
  CERTIFICACIONES,
  EQUIPOS,
  LICENCIAS,
  REGIONES,
} from '@/lib/constants/chile';

type Operador = {
  nombre_completo: string;
  telefono: string;
  años_experiencia: number;
  region: string;
  ciudad: string;
  bio?: string | null;
  disponible: boolean;
  licencias: string[];
  equipos_operados: string[];
  certificaciones: string[];
};

export function EditOperadorForm({
  operador,
  onSaved,
}: {
  operador: Operador;
  onSaved?: (next: Operador) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [isPending, startTransition] = useTransition();

  const [licencias, setLicencias] = useState(operador.licencias || []);
  const [equipos, setEquipos] = useState(operador.equipos_operados || []);
  const [certs, setCerts] = useState(operador.certificaciones || []);

  if (!editing) {
    return (
      <div className="card p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
          <button type="button" onClick={() => setEditing(true)} className="btn-secondary text-sm">
            Editar perfil
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Teléfono" value={operador.telefono} />
          <Field label="Experiencia" value={`${operador.años_experiencia} años`} />
          <Field label="Región" value={operador.region} />
          <Field label="Ciudad" value={operador.ciudad} />
          <Field
            label="Disponible"
            value={operador.disponible ? 'Sí — buscando trabajo' : 'No disponible'}
          />
          <Field label="Equipos" value={(operador.equipos_operados || []).join(', ') || '—'} />
          <Field label="Licencias" value={(operador.licencias || []).join(', ') || '—'} />
          <Field
            label="Certificaciones"
            value={(operador.certificaciones || []).join(', ') || '—'}
          />
        </div>
        {operador.bio && (
          <div className="mt-6">
            <p className="text-gray-400 text-sm mb-1">Bio</p>
            <p className="text-white text-sm">{operador.bio}</p>
          </div>
        )}
      </div>
    );
  }

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setOk('');
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const payload = {
        nombre_completo: String(fd.get('nombre_completo') || ''),
        telefono: String(fd.get('telefono') || ''),
        años_experiencia: Number(fd.get('años_experiencia') || 0),
        region: String(fd.get('region') || ''),
        ciudad: String(fd.get('ciudad') || ''),
        bio: String(fd.get('bio') || '') || null,
        disponible: fd.get('disponible') === 'on',
        licencias,
        equipos_operados: equipos,
        certificaciones: certs,
      };

      const result = await updateOperadorPerfilAction(payload);
      if (result.success === false) {
        setError(result.error);
        return;
      }
      setOk('Perfil actualizado');
      setEditing(false);
      onSaved?.(payload as Operador);
    });
  };

  return (
    <div className="card p-8 mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Editar perfil</h2>
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {ok && (
        <div className="bg-green-500/10 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4 text-sm">
          {ok}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="nombre_completo"
            label="Nombre completo"
            defaultValue={operador.nombre_completo}
            required
          />
          <Input name="telefono" label="Teléfono" defaultValue={operador.telefono} required />
          <Input
            name="años_experiencia"
            label="Años de experiencia"
            type="number"
            defaultValue={String(operador.años_experiencia)}
            min={0}
          />
          <div>
            <label className="block text-sm text-gray-300 mb-1">Región</label>
            <select
              name="region"
              defaultValue={operador.region}
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
          <Input name="ciudad" label="Ciudad" defaultValue={operador.ciudad} required />
          <label className="flex items-center gap-2 text-sm text-gray-300 mt-6">
            <input
              type="checkbox"
              name="disponible"
              defaultChecked={operador.disponible}
              className="rounded border-ink-500"
            />
            Disponible para trabajar
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Bio</label>
          <textarea
            name="bio"
            defaultValue={operador.bio || ''}
            rows={3}
            className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm"
          />
        </div>

        <ChipGroup
          label="Equipos operados"
          options={[...EQUIPOS]}
          selected={equipos}
          onToggle={(o) => toggle(equipos, setEquipos, o)}
        />
        <ChipGroup
          label="Licencias"
          options={[...LICENCIAS]}
          selected={licencias}
          onToggle={(o) => toggle(licencias, setLicencias, o)}
        />
        <ChipGroup
          label="Certificaciones"
          options={[...CERTIFICACIONES]}
          selected={certs}
          onToggle={(o) => toggle(certs, setCerts, o)}
        />

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
            {isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-white text-sm">{value}</p>
    </div>
  );
}

function Input({
  name,
  label,
  defaultValue,
  type = 'text',
  required,
  min,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        className="w-full px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm"
      />
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (o: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-gray-300 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={
                active
                  ? 'px-3 py-1.5 rounded-full text-xs font-semibold border bg-faena/20 border-faena/60 text-faena-300'
                  : 'px-3 py-1.5 rounded-full text-xs border bg-ink-800 border-ink-600 text-gray-400'
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
