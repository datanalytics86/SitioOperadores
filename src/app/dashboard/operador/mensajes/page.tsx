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
  const empresaId = sp.get('empresa') || '';

  const [operadorId, setOperadorId] = useState<string | null>(null);
  const [threads, setThreads] = useState<
    { vacante_id: string; empresa_id: string; titulo: string; nombre: string }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: op } = await supabase
        .from('operadores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!op) {
        router.push('/auth/setup-profile?role=operador');
        return;
      }
      setOperadorId(op.id);

      const { data: posts } = await supabase
        .from('postulaciones')
        .select(
          'vacante_id, vacantes!inner(titulo, empresa_id, empresas(nombre))'
        )
        .eq('operador_id', op.id)
        .limit(50);

      setThreads(
        ((posts as unknown as Array<Record<string, unknown>>) || []).map((p) => {
          const vacRaw = p.vacantes;
          const vac = (Array.isArray(vacRaw) ? vacRaw[0] : vacRaw) as
            | Record<string, unknown>
            | undefined;
          const empRaw = vac?.empresas;
          const emp = (Array.isArray(empRaw) ? empRaw[0] : empRaw) as
            | Record<string, unknown>
            | undefined;
          return {
            vacante_id: p.vacante_id as string,
            empresa_id: (vac?.empresa_id as string) || '',
            titulo: (vac?.titulo as string) || 'Vacante',
            nombre: (emp?.nombre as string) || 'Empresa',
          };
        })
      );
    };
    load();
  }, [supabase, router]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Link
              href="/dashboard/operador"
              className="text-sm text-faena-300 hover:text-faena"
            >
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-2">Mensajes</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <aside className="card p-3 max-h-[28rem] overflow-y-auto">
              <p className="text-xs text-gray-500 uppercase tracking-wider px-2 py-2">
                Por postulación
              </p>
              {threads.length === 0 ? (
                <p className="text-sm text-gray-500 px-2 py-4">
                  Postula a vacantes para chatear con empresas.
                </p>
              ) : (
                <ul className="space-y-1">
                  {threads.map((t) => {
                    const active =
                      t.vacante_id === vacanteId && t.empresa_id === empresaId;
                    return (
                      <li key={`${t.vacante_id}-${t.empresa_id}`}>
                        <Link
                          href={`/dashboard/operador/mensajes?vacante=${t.vacante_id}&empresa=${t.empresa_id}`}
                          className={`block px-3 py-2.5 rounded-lg text-sm ${
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
              {operadorId && vacanteId && empresaId ? (
                <ChatPanel
                  vacanteId={vacanteId}
                  operadorId={operadorId}
                  empresaId={empresaId}
                  emisor="operador"
                />
              ) : (
                <div className="card p-10 text-center text-gray-400 text-sm">
                  Selecciona una conversación.
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

export default function OperadorMensajesPage() {
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
