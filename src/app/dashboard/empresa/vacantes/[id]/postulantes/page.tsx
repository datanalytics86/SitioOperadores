'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { updatePostulacionEstadoAction } from '@/app/actions/postulaciones';

type Postulacion = {
  id: string;
  estado: 'pendiente' | 'visto' | 'aceptado' | 'rechazado';
  mensaje?: string | null;
  comentarios_empresa?: string | null;
  created_at: string;
  operador?: {
    id: string;
    nombre_completo: string;
    telefono: string;
    años_experiencia: number;
    region: string;
    ciudad: string;
    equipos_operados: string[];
    licencias: string[];
    cv_url?: string | null;
    avatar_url?: string | null;
  } | null;
};

const ESTADOS: Postulacion['estado'][] = ['pendiente', 'visto', 'aceptado', 'rechazado'];

const ESTADO_STYLE: Record<string, string> = {
  pendiente: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  visto: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  aceptado: 'bg-green-500/15 text-green-300 border-green-500/40',
  rechazado: 'bg-red-500/15 text-red-300 border-red-500/40',
};

export default function PostulantesPage() {
  const { id: vacanteId } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [titulo, setTitulo] = useState('');
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data: vacante, error: vErr } = await supabase
          .from('vacantes')
          .select('id, titulo, empresa_id, empresas!inner(user_id)')
          .eq('id', vacanteId)
          .maybeSingle();

        if (vErr) throw vErr;
        if (!vacante) {
          setError('Vacante no encontrada');
          return;
        }

        // Ownership: RLS filtra; si no hay fila, no es del usuario
        setTitulo(vacante.titulo as string);

        const { data, error: pErr } = await supabase
          .from('postulaciones')
          .select('*, operadores(*)')
          .eq('vacante_id', vacanteId)
          .order('created_at', { ascending: false });

        if (pErr) throw pErr;

        const mapped: Postulacion[] = (
          (data as unknown as Array<Record<string, unknown>>) || []
        ).map((row) => ({
          id: row.id as string,
          estado: row.estado as Postulacion['estado'],
          mensaje: (row.mensaje as string) ?? null,
          comentarios_empresa: (row.comentarios_empresa as string) ?? null,
          created_at: row.created_at as string,
          operador: (row.operadores as Postulacion['operador']) ?? null,
        }));
        setPostulaciones(mapped);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vacanteId, router, supabase]);

  const changeEstado = (postulacionId: string, estado: Postulacion['estado']) => {
    setMsg('');
    startTransition(async () => {
      const result = await updatePostulacionEstadoAction({
        postulacion_id: postulacionId,
        estado,
      });
      if (result.success === false) {
        setMsg(result.error);
        return;
      }
      setPostulaciones((prev) =>
        prev.map((p) => (p.id === postulacionId ? { ...p, estado } : p))
      );
      setMsg('Estado actualizado');
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-ink-800 pt-20 flex items-center justify-center">
          <p className="text-gray-400">Cargando postulantes…</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link
              href="/dashboard/empresa"
              className="text-sm text-faena-300 hover:text-faena mb-3 inline-block"
            >
              ← Volver al dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Postulantes</h1>
            <p className="text-gray-400 mt-1">{titulo}</p>
            <p className="text-sm text-gray-500 mt-1">
              {postulaciones.length} postulación{postulaciones.length !== 1 ? 'es' : ''}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          {msg && (
            <div className="bg-ink-700 border border-ink-600 text-gray-300 px-4 py-3 rounded-lg mb-6 text-sm">
              {msg}
            </div>
          )}

          {postulaciones.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-gray-400">Aún no hay postulantes para esta vacante.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {postulaciones.map((p) => (
                <div key={p.id} className="card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4 min-w-0">
                      {p.operador?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.operador.avatar_url}
                          alt=""
                          className="w-14 h-14 rounded-full object-cover border border-ink-500"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-ink-600 flex items-center justify-center text-xl text-gray-400">
                          {p.operador?.nombre_completo?.charAt(0) ?? '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white">
                          {p.operador?.nombre_completo ?? 'Operador'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {p.operador?.años_experiencia ?? 0} años · {p.operador?.ciudad},{' '}
                          {p.operador?.region}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(p.operador?.equipos_operados || []).join(', ') || 'Sin equipos'}
                        </p>
                        {p.mensaje && (
                          <p className="text-sm text-gray-300 mt-2 italic">&ldquo;{p.mensaje}&rdquo;</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-3 text-sm">
                          {p.operador?.telefono && (
                            <a
                              href={`tel:${p.operador.telefono}`}
                              className="text-faena-300 hover:text-faena"
                            >
                              {p.operador.telefono}
                            </a>
                          )}
                          {p.operador?.cv_url && (
                            <a
                              href={p.operador.cv_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-faena-300 hover:text-faena"
                            >
                              Ver CV
                            </a>
                          )}
                          <Link
                            href={`/dashboard/empresa/mensajes?vacante=${vacanteId}&operador=${p.operador?.id}`}
                            className="text-faena-300 hover:text-faena"
                          >
                            Mensaje
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${ESTADO_STYLE[p.estado]}`}
                      >
                        {p.estado}
                      </span>
                      <select
                        value={p.estado}
                        disabled={isPending}
                        onChange={(e) =>
                          changeEstado(p.id, e.target.value as Postulacion['estado'])
                        }
                        className="px-3 py-1.5 bg-ink-800 border border-ink-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-faena"
                        aria-label="Cambiar estado"
                      >
                        {ESTADOS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-600">
                        {new Date(p.created_at).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
