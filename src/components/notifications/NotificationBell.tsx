'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Notificacion = {
  id: string;
  tipo: string;
  payload: {
    titulo?: string;
    mensaje?: string;
    link?: string;
  };
  leida_en: string | null;
  created_at: string;
};

/**
 * Campana de notificaciones con Realtime subscription.
 * Se monta en Navbar cuando hay sesión.
 */
export function NotificationBell() {
  const supabase = createClient();
  const [items, setItems] = useState<Notificacion[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.leida_en).length;

  const load = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('notificaciones')
      .select('id, tipo, payload, leida_en, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20);
    setItems((data as Notificacion[]) || []);
  }, [supabase]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await load(user.id);

      channel = supabase
        .channel(`notif:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificaciones',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setItems((prev) => [payload.new as Notificacion, ...prev].slice(0, 20));
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, load]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!userId) return null;

  const markRead = async (id: string) => {
    await supabase
      .from('notificaciones')
      .update({ leida_en: new Date().toISOString() })
      .eq('id', id);
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, leida_en: new Date().toISOString() } : n
      )
    );
  };

  const markAllRead = async () => {
    const unreadIds = items.filter((n) => !n.leida_en).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from('notificaciones')
      .update({ leida_en: new Date().toISOString() })
      .in('id', unreadIds);
    setItems((prev) =>
      prev.map((n) => ({ ...n, leida_en: n.leida_en || new Date().toISOString() }))
    );
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-gray-400 hover:text-faena-300 transition-colors"
        aria-label={`Notificaciones${unread ? ` (${unread} sin leer)` : ''}`}
        aria-expanded={open}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-4 px-1 rounded-full bg-faena text-black text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-ink-700 border border-ink-600 rounded-xl shadow-card z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-600">
            <p className="text-sm font-semibold text-white">Notificaciones</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-faena-300 hover:text-faena"
              >
                Marcar todas leídas
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-sm text-gray-500 text-center">Sin notificaciones</p>
          ) : (
            <ul>
              {items.map((n) => {
                const link = n.payload?.link || '#';
                const content = (
                  <div
                    className={`px-4 py-3 border-b border-ink-600/60 hover:bg-ink-600/40 transition-colors ${
                      !n.leida_en ? 'bg-faena/5' : ''
                    }`}
                  >
                    <p className="text-sm text-white font-medium">
                      {n.payload?.titulo || n.tipo}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {n.payload?.mensaje}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {new Date(n.created_at).toLocaleString('es-CL')}
                    </p>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {link.startsWith('/') ? (
                      <Link
                        href={link}
                        onClick={() => {
                          if (!n.leida_en) markRead(n.id);
                          setOpen(false);
                        }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => {
                          if (!n.leida_en) markRead(n.id);
                        }}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
