'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { useEffect } from 'react';

/**
 * Search del hero: debounce y navega a /vacantes?q=
 * No hace fetch client-side de vacantes.
 */
export function HeroSearch({ initialQ = '' }: { initialQ?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const debounced = useDebouncedValue(q, 400);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Solo auto-navigate si el usuario ya interactuó (evita push al montar)
    if (!submitted && debounced === initialQ) return;
  }, [debounced, initialQ, submitted]);

  const go = (value: string) => {
    const params = new URLSearchParams();
    if (value.trim()) params.set('q', value.trim());
    router.push(params.toString() ? `/vacantes?${params}` : '/vacantes');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <input
        type="search"
        placeholder="¿Qué equipo operas o qué cargo buscas?"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setSubmitted(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            go(q);
          }
        }}
        className="flex-1 px-5 py-4 bg-ink-700/80 border border-ink-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-faena text-base"
        aria-label="Buscar empleos"
      />
      <button
        type="button"
        onClick={() => go(q)}
        className="btn-primary whitespace-nowrap px-8 py-4 text-base"
      >
        Buscar Empleos
      </button>
    </div>
  );
}
