'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sendMensajeAction } from '@/app/actions/mensajes';

type Mensaje = {
  id: string;
  texto: string;
  emisor: 'operador' | 'empresa';
  created_at: string;
};

export function ChatPanel({
  vacanteId,
  operadorId,
  empresaId,
  emisor,
  title,
}: {
  vacanteId: string;
  operadorId: string;
  empresaId: string;
  emisor: 'operador' | 'empresa';
  title?: string;
}) {
  const supabase = createClient();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const load = async () => {
      const { data } = await supabase
        .from('mensajes')
        .select('id, texto, emisor, created_at')
        .eq('vacante_id', vacanteId)
        .eq('operador_id', operadorId)
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: true });

      setMensajes((data as Mensaje[]) || []);
      setLoading(false);

      channel = supabase
        .channel(`chat:${vacanteId}:${operadorId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensajes',
            filter: `vacante_id=eq.${vacanteId}`,
          },
          (payload) => {
            const m = payload.new as Mensaje & {
              operador_id: string;
              empresa_id: string;
            };
            if (m.operador_id === operadorId && m.empresa_id === empresaId) {
              setMensajes((prev) =>
                prev.some((x) => x.id === m.id) ? prev : [...prev, m]
              );
            }
          }
        )
        .subscribe();
    };

    load();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, vacanteId, operadorId, empresaId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setError('');
    const body = texto.trim();
    setTexto('');

    startTransition(async () => {
      const result = await sendMensajeAction({
        vacante_id: vacanteId,
        operador_id: operadorId,
        empresa_id: empresaId,
        texto: body,
        emisor,
      });
      if (result.success === false) {
        setError(result.error);
        setTexto(body);
      }
    });
  };

  return (
    <div className="card flex flex-col h-[28rem]">
      {title && (
        <div className="px-4 py-3 border-b border-ink-600">
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-gray-500 text-sm">Cargando mensajes…</p>}
        {!loading && mensajes.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">
            Sin mensajes aún. Escribe el primero.
          </p>
        )}
        {mensajes.map((m) => {
          const mine = m.emisor === emisor;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? 'bg-faena text-black rounded-br-md'
                    : 'bg-ink-600 text-gray-100 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                <p
                  className={`text-[10px] mt-1 ${mine ? 'text-black/50' : 'text-gray-500'}`}
                >
                  {new Date(m.created_at).toLocaleTimeString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="px-4 text-xs text-red-300">{error}</p>
      )}

      <form onSubmit={send} className="p-3 border-t border-ink-600 flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje…"
          maxLength={2000}
          className="flex-1 px-3 py-2 bg-ink-800 border border-ink-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-faena"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !texto.trim()}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
