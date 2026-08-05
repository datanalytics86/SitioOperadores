'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { postularAction } from '@/app/actions/postulaciones';

interface Vacante {
  id: string;
  titulo: string;
  equipo_requerido: string;
  empresa?: { nombre: string } | null;
  region: string;
  turno: string;
}

interface Props {
  vacante: Vacante;
  onClose: () => void;
}

type Step = 'loading' | 'form' | 'success' | 'login';

export default function PostulacionModal({ vacante, onClose }: Props) {
  const supabase = createClient();
  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState('');
  const [operadorProfile, setOperadorProfile] = useState<{
    id: string;
    nombre_completo: string;
    telefono: string;
  } | null>(null);
  const [comentario, setComentario] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStep('login');
        return;
      }
      const { data: op } = await supabase
        .from('operadores')
        .select('id, nombre_completo, telefono')
        .eq('user_id', user.id)
        .maybeSingle();

      if (op) {
        setOperadorProfile(op);
        setStep('form');
      } else {
        setStep('login');
      }
    };
    check();
  }, [supabase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operadorProfile) {
      setStep('login');
      return;
    }
    if (vacante.id.startsWith('mock-')) {
      setError('Esta vacante es de demostración. No se puede postular.');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await postularAction({
        vacante_id: vacante.id,
        mensaje: comentario || null,
      });
      if (result.success === false) {
        setError(result.error);
        return;
      }
      setStep('success');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="postulacion-title"
        className="relative w-full max-w-lg bg-ink-700 rounded-2xl border border-ink-600 shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between p-6 border-b border-ink-600">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs text-faena-300 font-semibold uppercase tracking-wider mb-1">
              Postulación
            </p>
            <h2 id="postulacion-title" className="text-xl font-bold text-white truncate">
              {vacante.titulo}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {vacante.empresa?.nombre} · {vacante.region} ·{' '}
              <span className="capitalize">{vacante.turno}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === 'loading' && (
            <p className="text-gray-400 text-sm">Verificando sesión…</p>
          )}

          {step === 'login' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Para postular necesitas una cuenta de <strong>operador</strong>.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/auth/login" className="btn-secondary py-3 text-sm text-center">
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/signup?role=operador"
                  className="btn-primary py-3 text-sm text-center"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">¡Postulación enviada!</h3>
              <p className="text-sm text-gray-400">
                La empresa revisará tu perfil. Te avisaremos si hay novedades.
              </p>
              <Link href="/dashboard/operador" className="btn-primary inline-block">
                Ver mis postulaciones
              </Link>
            </div>
          )}

          {step === 'form' && operadorProfile && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-ink-800 rounded-lg p-4 text-sm space-y-1">
                <p className="text-white font-medium">{operadorProfile.nombre_completo}</p>
                <p className="text-gray-400">{operadorProfile.telefono}</p>
              </div>

              <div>
                <label
                  htmlFor="mensaje-postulacion"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Mensaje (opcional)
                </label>
                <textarea
                  id="mensaje-postulacion"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-faena"
                  placeholder="Cuéntale a la empresa por qué eres el fit ideal…"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isPending ? 'Enviando…' : 'Enviar postulación'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
