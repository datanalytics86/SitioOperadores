'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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

type Step = 'form' | 'success' | 'login';

export default function PostulacionModal({ vacante, onClose }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operadorProfile, setOperadorProfile] = useState<any>(null);

  // Form fields (for unauthenticated users)
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [experiencia, setExperiencia] = useState('1-3');
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: op } = await supabase
          .from('operadores')
          .select('id, nombre_completo, telefono')
          .eq('user_id', user.id)
          .maybeSingle();
        setOperadorProfile(op || null);
        if (op) {
          setNombre(op.nombre_completo || '');
          setTelefono(op.telefono || '');
        }
      }
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && operadorProfile) {
        // Logged in with profile — direct postulation
        const { error: err } = await supabase.from('postulaciones').insert({
          vacante_id: vacante.id,
          operador_id: operadorProfile.id,
          estado: 'pendiente',
        });
        if (err) throw err;
      } else if (user && !operadorProfile) {
        // Logged in but no profile yet
        setStep('login');
        setLoading(false);
        return;
      } else {
        // Not logged in — show link to signup
        setStep('login');
        setLoading(false);
        return;
      }

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

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {operadorProfile ? (
                /* Logged in with profile — show quick confirm */
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
              ) : (
                /* Not logged in — collect basic info */
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Nombre *</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                        placeholder="Juan Pérez"
                        className="w-full px-3 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-faena"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Teléfono *</label>
                      <input
                        type="tel"
                        value={telefono}
                        onChange={e => setTelefono(e.target.value)}
                        required
                        placeholder="+56 9 XXXX"
                        className="w-full px-3 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-faena"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Correo electrónico *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="tu@email.com"
                      className="w-full px-3 py-2.5 bg-ink-800 border border-ink-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-faena"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Años de experiencia con {vacante.equipo_requerido}</label>
                <div className="grid grid-cols-4 gap-2">
                  {['<1', '1-3', '3-7', '7+'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setExperiencia(v)}
                      className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        experiencia === v
                          ? 'bg-faena/20 border-faena/60 text-faena-300'
                          : 'bg-ink-800 border-ink-600 text-gray-400 hover:border-faena/30'
                      }`}
                    >
                      {v} años
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Mensaje para la empresa (opcional)</label>
                <textarea
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  rows={3}
                  placeholder="Destaca tu experiencia, certificaciones o disponibilidad..."
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
                      Enviando...
                    </span>
                  ) : 'Enviar postulación'}
                </button>
              </div>

              {!operadorProfile && (
                <p className="text-center text-xs text-gray-500">
                  ¿Tienes cuenta?{' '}
                  <Link href="/auth/login" className="text-faena-300 hover:text-faena">Inicia sesión</Link>
                  {' '}para postular más rápido
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
