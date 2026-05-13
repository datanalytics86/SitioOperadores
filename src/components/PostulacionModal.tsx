'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Vacante {
  id: string;
  titulo: string;
  equipo_requerido: string;
  empresa?: { nombre: string };
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operadorProfile, setOperadorProfile] = useState<any>(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operadorProfile) {
      setStep('login');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { error: err } = await supabase.from('postulaciones').insert({
        vacante_id: vacante.id,
        operador_id: operadorProfile.id,
        estado: 'pendiente',
        mensaje: comentario || null,
      });
      if (err) throw err;
      setStep('success');
    } catch (err: any) {
      if (err.message?.includes('duplicate') || err.code === '23505') {
        setError('Ya postulaste a esta vacante anteriormente.');
      } else {
        setError(err.message || 'Error al enviar postulación');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-ink-700 rounded-2xl border border-ink-600 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-ink-600">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs text-faena-300 font-semibold uppercase tracking-wider mb-1">
              Postulación
            </p>
            <h2 className="text-lg font-bold text-white line-clamp-2">{vacante.titulo}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-400">
              {vacante.empresa && <span>{vacante.empresa.nombre}</span>}
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>{vacante.region}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span className="capitalize">{vacante.turno}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'loading' && (
            <div className="text-center py-8">
              <span className="inline-block w-6 h-6 border-2 border-faena border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm mt-3">Verificando perfil…</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Postulacion enviada</h3>
              <p className="text-gray-400 text-sm mb-6">
                La empresa revisará tu perfil y se pondrá en contacto si hay match.
              </p>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 btn-secondary py-2.5 text-sm">Cerrar</button>
                <Link href="/dashboard/operador" className="flex-1 btn-primary py-2.5 text-sm text-center">
                  Ver mis postulaciones
                </Link>
              </div>
            </div>
          )}

          {step === 'login' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-faena/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-faena" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Crea tu perfil gratis</h3>
              <p className="text-gray-400 text-sm mb-6">
                Para postular necesitas tener un perfil de operador. Es rápido y gratis.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/auth/signup?role=operador" className="btn-primary py-3 text-sm text-center">
                  Crear cuenta de operador
                </Link>
                <Link href="/auth/login" className="btn-secondary py-3 text-sm text-center">
                  Ya tengo cuenta — iniciar sesión
                </Link>
              </div>
            </div>
          )}

          {step === 'form' && operadorProfile && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-ink-800 rounded-xl border border-ink-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-faena/20 border border-faena/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-faena" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{operadorProfile.nombre_completo}</p>
                    {operadorProfile.telefono && (
                      <p className="text-gray-400 text-xs">{operadorProfile.telefono}</p>
                    )}
                  </div>
                  <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full">
                    Verificado
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="postulacion-mensaje" className="block text-xs font-medium text-gray-400 mb-1.5">
                  Mensaje para la empresa (opcional)
                </label>
                <textarea
                  id="postulacion-mensaje"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  placeholder="Destaca tu experiencia, certificaciones o disponibilidad…"
                  className="w-full px-3 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-faena resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-3 py-2.5 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3 text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 text-sm disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Enviando…
                    </span>
                  ) : (
                    'Enviar postulación'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
