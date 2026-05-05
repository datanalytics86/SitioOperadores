'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('users').select('role').eq('id', user.id).maybeSingle()
          .then(({ data }) => setUserRole(data?.role || null));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (() => {
        setUser(session?.user || null);
        if (!session?.user) setUserRole(null);
      })();
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setMobileOpen(false);
  };

  const isLanding = pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || !isLanding
        ? 'bg-ink-800/95 backdrop-blur-lg border-b border-ink-600 shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-faena rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-display text-xl text-faena tracking-wide">OperadoresFaena</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a href={isLanding ? '#inicio' : '/'} className="text-sm text-gray-400 hover:text-faena-300 transition-colors">Inicio</a>
            <a href={isLanding ? '#empleos' : '/#empleos'} className="text-sm text-gray-400 hover:text-faena-300 transition-colors">Empleos</a>
            <a href={isLanding ? '#como-funciona' : '/#como-funciona'} className="text-sm text-gray-400 hover:text-faena-300 transition-colors">Cómo funciona</a>
            <a href={isLanding ? '#empresas' : '/#empresas'} className="text-sm text-gray-400 hover:text-faena-300 transition-colors">Empresas</a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  href={userRole === 'empresa' ? '/dashboard/empresa' : '/dashboard/operador'}
                  className="text-sm text-gray-300 hover:text-faena-300 transition-colors"
                >
                  Mi Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm px-4 py-2">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm">
                  Ingresar
                </Link>
                <Link href="/auth/signup?role=empresa" className="btn-primary text-sm">
                  Publicar vacante
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-ink-700 transition-colors"
            aria-label="Menú"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-ink-600 pt-3 space-y-1">
            <a href={isLanding ? '#inicio' : '/'} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-300 hover:text-faena-300 rounded-lg hover:bg-ink-700 transition-colors">Inicio</a>
            <a href={isLanding ? '#empleos' : '/#empleos'} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-300 hover:text-faena-300 rounded-lg hover:bg-ink-700 transition-colors">Empleos</a>
            <a href={isLanding ? '#como-funciona' : '/#como-funciona'} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-300 hover:text-faena-300 rounded-lg hover:bg-ink-700 transition-colors">Cómo funciona</a>
            <div className="border-t border-ink-600 pt-3 mt-2 flex flex-col gap-2 px-1">
              {user ? (
                <>
                  <Link
                    href={userRole === 'empresa' ? '/dashboard/empresa' : '/dashboard/operador'}
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary text-sm text-center py-2.5"
                  >
                    Mi Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-ghost text-sm py-2.5 border border-ink-600 rounded-lg">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm text-center py-2.5">
                    Ingresar
                  </Link>
                  <Link href="/auth/signup?role=empresa" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center py-2.5">
                    Publicar vacante
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
