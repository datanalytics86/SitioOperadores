'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-800/80 backdrop-blur-lg border-b border-ink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-faena rounded-lg flex items-center justify-center">
              <span className="text-black font-bold">⚙️</span>
            </div>
            <span className="hidden sm:inline font-display text-xl text-faena">OperadoresFaena</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
              Inicio
            </a>
            <a href="#empleos" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
              Empleos
            </a>
            <a href="#empresas" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
              Empresas
            </a>
            <a href="#operadores" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
              Operadores
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login" className="btn-ghost text-sm">
              Soy Operador
            </Link>
            <Link href="/auth/login?role=empresa" className="btn-primary text-sm">
              Publicar
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-ink-700 transition-colors"
            aria-label="Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#inicio" className="block px-4 py-2 text-sm text-gray-400 hover:text-faena-300 transition-colors">
              Inicio
            </a>
            <a href="#empleos" className="block px-4 py-2 text-sm text-gray-400 hover:text-faena-300 transition-colors">
              Empleos
            </a>
            <a href="#empresas" className="block px-4 py-2 text-sm text-gray-400 hover:text-faena-300 transition-colors">
              Empresas
            </a>
            <div className="flex flex-col space-y-2 px-4 pt-2 border-t border-ink-600">
              <Link href="/auth/login" className="btn-secondary text-sm text-center">
                Soy Operador
              </Link>
              <Link href="/auth/login?role=empresa" className="btn-primary text-sm text-center">
                Publicar
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
