'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=80"
          alt="Maquinaria pesada en minería"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-800/70 to-ink-900/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-faena mb-6 leading-tight">
            OperadoresFaena.cl
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-4 leading-relaxed">
            La mejor forma de encontrar o conseguir trabajo como operador en Chile
          </p>

          {/* Equipment Types */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['CAEX', 'Cargador Frontal', 'Retroexcavadora', 'Camiones'].map((equipo) => (
              <span
                key={equipo}
                className="px-4 py-2 bg-faena/10 border border-faena/40 text-faena-300 text-sm font-semibold rounded-full"
              >
                {equipo}
              </span>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="¿Qué equipo operas?"
                className="flex-1 px-6 py-4 bg-ink-700/80 border border-ink-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-faena"
              />
              <button className="btn-primary whitespace-nowrap">
                Buscar Empleos
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="#empleos" className="btn-primary text-center">
              Ver empleos disponibles
            </Link>
            <Link href="/auth/login?role=empresa" className="btn-secondary text-center">
              Publicar oferta gratis
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold text-faena">+1.800</p>
              <p className="text-sm text-gray-400">Operadores</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-faena">420</p>
              <p className="text-sm text-gray-400">Vacantes activas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-faena">96%</p>
              <p className="text-sm text-gray-400">Satisfacción</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
