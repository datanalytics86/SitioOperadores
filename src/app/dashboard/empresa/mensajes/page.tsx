'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChatPanel } from '@/components/chat/ChatPanel';

function MensajesContent() {
  const supabase = createClient();
  const router = useRouter();
  const sp = useSearchParams();
  const vacanteId = sp.get('vacante') || '';
  const operadorId = sp.get('operador') || '';

  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [title, setTitle] = useState('Mensajes');
  const [threads, setThreads] = useState<
    { vacante_id: string; operador_id: string; titulo: string; nombre: string }[]
  >([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!empresa) {
        router.push('/auth/setup-profile?role=empresa');
        return;
      }
      setEmpresaId(empresa.id);

      // Threads: postulaciones de mis vacantes (candidatos con quienes chatear)
      const { data: posts } = await supabase
        .from('postulaciones')
        .select(
          'operador_id, vacante_id, vacantes!inner(titulo, empresa_id), operador:operadores(nombre_completo)'
        )
        .eq('vacantes.empresa_id', empresa.id)
        .limit(50);

      const mapped = ((posts as unknown as Array<Record<string, unknown>>) || []).map((p) => {
        const vac = Array.isArray(p.vacantes) ? p.vacantes[0] : p.vacantes;
        const op = Array.isArray(p.operador) ? p.operador[0] : p.operador;
        return {
          vacante_id: p.vacante_id as string,
          operador_id: p.operador_id as string,
          titulo: (vac?.titulo as string) || 'Vacante',
          nombre: (op?.nombre_completo as string) || 'Operador',
        };
      });

      setThreads(mapped);

      if (vacanteId && operadorId) {
        const t = mapped.find(
          (x) => x.vacante_id === vacanteId && x.operador_id === operadorId
        );
        if (t) setTitle(`${t.nombre} · ${t.titulo}`);
      }
    };
    load().catch((e) => setError(e.message));
  }, [supabase, router, vacanteId, operadorId]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Link
              href="/dashboard/empresa"
              className="text-sm text-faena-300 hover:text-faena"
            >
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-2">Mensajes</h1>
          </div>

          {error && (
            <p className="text-red-300 text-sm mb-4">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <aside className="card p-3 max-h-[28rem] overflow-y-auto">
              <p className="text-xs text-gray-500 uppercase tracking-wider px-2 py-2">
                Conversaciones
              </p>
              {threads.length === 0 ? (
                <p className="text-sm text-gray-500 px-2 py-4">
                  Aún no hay postulantes para chatear.
                </p>
              ) : (
                <ul className="space-y-1">
                  {threads.map((t) => {
                    const active =
                      t.vacante_id === vacanteId && t.operador_id === operadorId;
                    return (
                      <li key={`${t.vacante_id}-${t.operador_id}`}>
                        <Link
                          href={`/dashboard/empresa/mensajes?vacante=${t.vacante_id}&operador=${t.operador_id}`}
                          className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            active
                              ? 'bg-faena/15 text-faena-300'
                              : 'text-gray-300 hover:bg-ink-600'
                          }`}
                        >
                          <p className="font-medium truncate">{t.nombre}</p>
                          <p className="text-xs text-gray-500 truncate">{t.titulo}</p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>

            <div className="md:col-span-2">
              {empresaId && vacanteId && operadorId ? (
                <ChatPanel
                  vacanteId={vacanteId}
                  operadorId={operadorId}
                  empresaId={empresaId}
                  emisor="empresa"
                  title={title}
                />
              ) : (
                <div className="card p-10 text-center text-gray-400 text-sm">
                  Selecciona una conversación o abre el chat desde un postulante.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function EmpresaMensajesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink-800 flex items-center justify-center text-gray-400">
          Cargando…
        </div>
      }
    >
      <MensajesContent />
    </Suspense>
  );
}
