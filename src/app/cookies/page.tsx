import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Política de Cookies — OperadoresFaena.cl',
  description: 'Qué cookies usa OperadoresFaena.cl y cómo controlarlas.',
};

export default function Cookies() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="section-label">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-3">Política de Cookies</h1>
          <p className="text-gray-500 text-sm mb-10">Última actualización: 7 de mayo de 2026</p>

          <article className="prose prose-invert max-w-none text-gray-300 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white">¿Qué son las cookies?</h2>
              <p>
                Las cookies son pequeños archivos que un sitio web guarda en tu dispositivo para
                recordar información entre visitas (sesión, preferencias, métricas).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Cookies que usamos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-ink-600">
                  <thead className="bg-ink-700 text-white">
                    <tr>
                      <th className="text-left p-3 border-b border-ink-600">Tipo</th>
                      <th className="text-left p-3 border-b border-ink-600">Propósito</th>
                      <th className="text-left p-3 border-b border-ink-600">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr>
                      <td className="p-3 border-b border-ink-600 font-medium">Sesión (Supabase)</td>
                      <td className="p-3 border-b border-ink-600">
                        Mantenerte logueado y refrescar tu token de autenticación.
                      </td>
                      <td className="p-3 border-b border-ink-600">1 hora (rotación)</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-b border-ink-600 font-medium">Funcionales</td>
                      <td className="p-3 border-b border-ink-600">
                        Recordar tus preferencias dentro del sitio (filtros, idioma).
                      </td>
                      <td className="p-3 border-b border-ink-600">30 días</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Analíticas</td>
                      <td className="p-3">
                        Métricas agregadas y anónimas de uso (Vercel Analytics).
                      </td>
                      <td className="p-3">24 meses</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                <strong>No usamos cookies de marketing ni de terceros para publicidad.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Cómo controlar las cookies</h2>
              <p>
                Puedes bloquear o eliminar cookies desde la configuración de tu navegador (Chrome,
                Firefox, Safari, Edge). Ten en cuenta que sin las cookies de sesión no podrás
                iniciar sesión en el Sitio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Contacto</h2>
              <p>
                Preguntas:{' '}
                <a href="mailto:contacto@operadoresfaena.cl" className="text-faena-300 hover:text-faena">
                  contacto@operadoresfaena.cl
                </a>
              </p>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
