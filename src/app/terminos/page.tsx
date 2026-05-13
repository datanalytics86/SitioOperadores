import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — OperadoresFaena.cl',
  description:
    'Términos y condiciones de uso de OperadoresFaena.cl, plataforma de empleos para operadores de maquinaria pesada en Chile.',
};

export default function Terminos() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="section-label">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-3">Términos y Condiciones</h1>
          <p className="text-gray-500 text-sm mb-10">Última actualización: 7 de mayo de 2026</p>

          <article className="prose prose-invert max-w-none text-gray-300 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white">1. Aceptación</h2>
              <p>
                Al usar OperadoresFaena.cl (el &ldquo;Sitio&rdquo;), aceptas estos Términos y
                Condiciones. Si no estás de acuerdo, no debes usar el Sitio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">2. Quién puede registrarse</h2>
              <p>
                Pueden registrarse: (a) personas naturales mayores de 18 años con licencias o
                certificaciones reales para operar maquinaria pesada en Chile (&ldquo;Operadores&rdquo;),
                y (b) personas jurídicas inscritas en el Servicio de Impuestos Internos
                (&ldquo;Empresas&rdquo;). Te comprometes a entregar información veraz, completa y
                actualizada.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">3. Uso aceptable</h2>
              <p>No puedes usar el Sitio para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Publicar información falsa, engañosa o que infrinja derechos de terceros.</li>
                <li>Discriminar por raza, género, edad, religión, orientación sexual u otros motivos prohibidos por ley.</li>
                <li>Cobrar a operadores a cambio de su postulación a una vacante.</li>
                <li>Hacer scraping automatizado o intentar acceder a datos de otros usuarios.</li>
                <li>Eludir las medidas técnicas, de seguridad o de cumplimiento del Sitio.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">4. Rol de OperadoresFaena.cl</h2>
              <p>
                Somos una plataforma de intermediación. No somos empleador, no garantizamos la
                veracidad de la información publicada por Operadores o Empresas, ni intervenimos
                en la relación laboral resultante. La contratación, condiciones, sueldo y
                cualquier disputa son responsabilidad exclusiva de las partes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">5. Contenido del usuario</h2>
              <p>
                Conservas la propiedad de tu CV, foto, datos y publicaciones. Nos otorgas una
                licencia limitada para mostrarlos a otros usuarios dentro del Sitio con el fin de
                facilitar el matching laboral.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">6. Cuenta y seguridad</h2>
              <p>
                Eres responsable de mantener la confidencialidad de tu contraseña y de toda
                actividad bajo tu cuenta. Notifícanos de cualquier acceso no autorizado en{' '}
                <a href="mailto:contacto@operadoresfaena.cl" className="text-faena-300 hover:text-faena">
                  contacto@operadoresfaena.cl
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">7. Terminación</h2>
              <p>
                Podemos suspender o eliminar cuentas que infrinjan estos Términos, sin perjuicio
                de las acciones legales que correspondan.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">8. Limitación de responsabilidad</h2>
              <p>
                El Sitio se entrega &ldquo;tal cual&rdquo;, sin garantías de disponibilidad ni
                resultado. En la máxima medida permitida por la ley chilena, no respondemos por
                daños indirectos derivados del uso o imposibilidad de uso del Sitio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">9. Ley aplicable</h2>
              <p>
                Estos Términos se rigen por las leyes de la República de Chile. Cualquier
                controversia se someterá a los tribunales ordinarios de Santiago.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">10. Cambios</h2>
              <p>
                Podemos actualizar estos Términos en cualquier momento. Los cambios sustantivos se
                notificarán por email o en el Sitio con al menos 15 días de anticipación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Contacto</h2>
              <p>
                Para consultas sobre estos Términos:{' '}
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
