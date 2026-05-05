export default function Footer() {
  return (
    <footer className="bg-ink-900 border-t border-ink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1 */}
          <div>
            <h4 className="text-sm font-semibold text-faena-300 uppercase tracking-wider mb-4">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#empleos" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  Empleos
                </a>
              </li>
              <li>
                <a href="#blog" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-sm font-semibold text-faena-300 uppercase tracking-wider mb-4">
              Para Operadores
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/auth/signup" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  Crear cuenta
                </a>
              </li>
              <li>
                <a href="/dashboard/operador" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  Mi perfil
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  Mis postulaciones
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-sm font-semibold text-faena-300 uppercase tracking-wider mb-4">
              Para Empresas
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/auth/login?role=empresa" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  Publicar vacante
                </a>
              </li>
              <li>
                <a href="/dashboard/empresa" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  Mi empresa
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  Planes
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-sm font-semibold text-faena-300 uppercase tracking-wider mb-4">
              Contacto
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:soporte@operadoresfaena.cl" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  soporte@operadoresfaena.cl
                </a>
              </li>
              <li>
                <a href="tel:+56912345678" className="text-sm text-gray-400 hover:text-faena-300 transition-colors">
                  +56 9 1234 5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-ink-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 OperadoresFaena.cl — Hecho en Chile 🇨🇱
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-faena-300 transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-gray-500 hover:text-faena-300 transition-colors">
                Términos
              </a>
              <a href="#" className="text-gray-500 hover:text-faena-300 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
