'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ROTATING_WORDS = ['CAEX', 'Cargador Frontal', 'Retroexcavadora', 'Camión Minero', 'Excavadora', 'Bulldozer'];

export default function Hero() {
  const router = useRouter();
  const [wordIdx, setWordIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    router.push(`/vacantes${params}`);
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=80"
          alt="Maquinaria pesada en minería Chile"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 bg-faena rounded-full animate-pulse" />
            <p className="text-faena-300 text-sm font-semibold uppercase tracking-widest">
              #1 en empleos de maquinaria pesada en Chile
            </p>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display text-white leading-none mb-3">
            EMPLEOS PARA
          </h1>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-display leading-none mb-6">
            <span
              className="text-faena"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
                display: 'inline-block',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
              }}
            >
              {ROTATING_WORDS[wordIdx]}
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
            Conectamos operadores certificados con empresas mineras y constructoras
            en todo Chile. Sin intermediarios.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-8 max-w-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="¿Qué equipo operas? ej: CAEX..."
                  className="w-full pl-12 pr-4 py-4 bg-ink-800/90 border border-ink-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-faena text-sm"
                />
              </div>
              <button type="submit" className="btn-primary px-8 py-4 rounded-xl text-sm whitespace-nowrap">
                Buscar empleos
              </button>
            </div>
          </form>

          {/* Equipment chips */}
          <div className="flex flex-wrap gap-2 mb-10">
            {ROTATING_WORDS.map(eq => (
              <button
                key={eq}
                onClick={() => router.push(`/vacantes?q=${encodeURIComponent(eq)}`)}
                className="px-3 py-1.5 bg-white/5 border border-white/15 text-gray-300 text-xs font-medium rounded-full hover:border-faena/50 hover:text-faena-300 transition-colors"
              >
                {eq}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <Link href="/vacantes" className="btn-primary text-center px-8 py-3">
              Ver todos los empleos
            </Link>
            <Link href="/auth/signup?role=empresa" className="btn-secondary text-center px-8 py-3">
              Publicar oferta gratis
            </Link>
          </div>

          {/* Stats inline */}
          <div className="flex gap-8">
            {[
              { v: '+1.800', l: 'Operadores' },
              { v: '420', l: 'Vacantes activas' },
              { v: '96%', l: 'Satisfacción' },
            ].map(s => (
              <div key={s.l}>
                <p className="text-2xl sm:text-3xl font-bold text-faena">{s.v}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-5 h-5 text-faena/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
