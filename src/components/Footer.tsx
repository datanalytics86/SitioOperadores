import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink-900 border-t border-ink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-faena rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-display text-xl text-faena">OperadoresFaena</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              La plataforma especializada en empleos para operadores de maquinaria pesada en Chile.
            </p>
            <div className="flex gap-3">
              {[
                { label: 'LinkedIn', d: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
                { label: 'Instagram', d: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z' },
              ].map(s => (
                <a key={s.label} href="#" aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-ink-700 border border-ink-600 flex items-center justify-center text-gray-400 hover:text-faena hover:border-faena/40 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Operadores */}
          <div>
            <h4 className="text-xs font-bold text-faena-400 uppercase tracking-wider mb-4">Operadores</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/vacantes', label: 'Ver empleos' },
                { href: '/auth/signup?role=operador', label: 'Crear cuenta' },
                { href: '/auth/login', label: 'Iniciar sesión' },
                { href: '/dashboard/operador', label: 'Mi perfil' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresas */}
          <div>
            <h4 className="text-xs font-bold text-faena-400 uppercase tracking-wider mb-4">Empresas</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/auth/signup?role=empresa', label: 'Publicar vacante' },
                { href: '/dashboard/empresa', label: 'Mi empresa' },
                { href: '/dashboard/empresa/nueva-vacante', label: 'Nueva vacante' },
                { href: '/#empresas', label: 'Cómo funciona' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-xs font-bold text-faena-400 uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:contacto@operadoresfaena.cl" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  contacto@operadoresfaena.cl
                </a>
              </li>
              <li>
                <a href="tel:+56221234567" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  +56 2 2123 4567
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-500">Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-700 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} OperadoresFaena.cl &mdash; Hecho en Chile
          </p>
          <div className="flex gap-5">
            {['Privacidad', 'Términos', 'Cookies'].map(l => (
              <a key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
