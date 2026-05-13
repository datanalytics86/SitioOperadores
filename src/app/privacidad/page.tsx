import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Política de Privacidad — OperadoresFaena.cl',
  description:
    'Cómo OperadoresFaena.cl recolecta, usa y protege tus datos personales bajo la Ley 19.628 de Protección de la Vida Privada de Chile.',
};

export default function Privacidad() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="section-label">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-3">Política de Privacidad</h1>
          <p className="text-gray-500 text-sm mb-10">Última actualización: 7 de mayo de 2026</p>

          <article className="prose prose-invert max-w-none text-gray-300 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white">1. Marco legal</h2>
              <p>
                OperadoresFaena.cl trata datos personales conforme a la Ley N° 19.628 sobre
                Protección de la Vida Privada de Chile, sus modificaciones y la normativa
                aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">2. Qué datos recolectamos</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>De Operadores:</strong> nombre, RUT, teléfono, email, foto, CV, licencias, equipos operados, certificaciones, región y ciudad.</li>
                <li><strong>De Empresas:</strong> razón social, RUT, teléfono, email del usuario responsable, región y ciudad.</li>
                <li><strong>De uso:</strong> dirección IP aproximada, navegador, páginas visitadas, eventos de postulación.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">3. Para qué los usamos</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Facilitar el matching entre Operadores y Empresas.</li>
                <li>Operar el Sitio: autenticación, notificaciones, soporte.</li>
                <li>Cumplir obligaciones legales y prevenir fraude.</li>
                <li>Mejorar el producto a partir de métricas agregadas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">4. Con quién los compartimos</h2>
              <p>
                Tus datos visibles en tu perfil son accesibles a Empresas registradas para
                propósitos de reclutamiento. Compartimos datos con proveedores de infraestructura
                que actúan como encargados (Vercel para hosting, Supabase para base de datos y
                autenticación, ambos con sede fuera de Chile). No vendemos tus datos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">5. Conservación</h2>
              <p>
                Conservamos tus datos mientras tu cuenta esté activa, salvo obligación legal de
                conservación más larga. Si eliminas tu cuenta, eliminamos o anonimizamos los datos
                personales asociados dentro de los 30 días.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">6. Tus derechos (Ley 19.628)</h2>
              <p>Tienes derecho a:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Acceder a los datos que tenemos sobre ti.</li>
                <li>Rectificar datos inexactos.</li>
                <li>Cancelar (eliminar) datos cuyo tratamiento no esté autorizado por ley.</li>
                <li>Oponerte al tratamiento para fines específicos.</li>
              </ul>
              <p>
                Para ejercer estos derechos escríbenos a{' '}
                <a href="mailto:contacto@operadoresfaena.cl" className="text-faena-300 hover:text-faena">
                  contacto@operadoresfaena.cl
                </a>
                . Responderemos dentro de los plazos que indique la ley.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">7. Seguridad</h2>
              <p>
                Aplicamos medidas técnicas y organizativas razonables: cifrado en tránsito (TLS),
                contraseñas hasheadas, Row Level Security en la base de datos, control de accesos
                interno. Ningún sistema es 100% seguro: si detectas una vulnerabilidad, repórtala
                a{' '}
                <a href="mailto:contacto@operadoresfaena.cl" className="text-faena-300 hover:text-faena">
                  contacto@operadoresfaena.cl
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">8. Cookies</h2>
              <p>
                Usamos cookies funcionales (sesión, preferencias) y analíticas agregadas. Revisa
                nuestra{' '}
                <a href="/cookies" className="text-faena-300 hover:text-faena">Política de Cookies</a>{' '}
                para más detalle.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">9. Cambios a esta política</h2>
              <p>
                Te avisaremos por email o dentro del Sitio si hacemos cambios sustanciales. La
                versión vigente siempre estará disponible en esta página.
              </p>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
