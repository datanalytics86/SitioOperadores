import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Planes para empresas | OperadoresFaena.cl',
  description:
    'Publica vacantes y contrata operadores calificados. Planes Starter, Pro y Enterprise con pago vía Transbank.',
};

type Plan = {
  id: string;
  nombre: string;
  precio: number;
  vacantes_incluidas: number;
  caracteristicas: string[];
  activo: boolean;
};

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'starter',
    nombre: 'Starter',
    precio: 0,
    vacantes_incluidas: 2,
    caracteristicas: [
      '2 vacantes activas',
      'Postulaciones ilimitadas',
      'Chat con operadores',
      'Soporte por email',
    ],
    activo: true,
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: 49990,
    vacantes_incluidas: 10,
    caracteristicas: [
      '10 vacantes activas',
      'Destacado en listados',
      'Notificaciones prioritarias',
      'Estadísticas básicas',
      'Soporte prioritario',
    ],
    activo: true,
  },
  {
    id: 'enterprise',
    nombre: 'Enterprise',
    precio: 149990,
    vacantes_incluidas: 50,
    caracteristicas: [
      '50 vacantes activas',
      'Multi-usuario RR.HH.',
      'API de integración',
      'Account manager',
      'SLA 99.9%',
    ],
    activo: true,
  },
];

async function getPlanes(): Promise<Plan[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('planes_suscripcion')
      .select('*')
      .eq('activo', true)
      .order('precio', { ascending: true });
    if (data && data.length > 0) return data as Plan[];
  } catch {
    /* fallback */
  }
  return FALLBACK_PLANS;
}

function formatCLP(n: number) {
  if (n === 0) return 'Gratis';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function PlanesPage() {
  const planes = await getPlanes();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Para empresas</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Planes que escalan contigo
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Publica vacantes y conecta con operadores calificados en todo Chile.
              Pagos seguros con <strong className="text-white">Transbank Webpay Plus</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {planes.map((plan, i) => {
              const featured = plan.nombre.toLowerCase().includes('pro');
              return (
                <div
                  key={plan.id}
                  className={`card p-8 flex flex-col relative ${
                    featured ? 'border-faena/50 shadow-glow-faena' : ''
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-faena text-black text-xs font-bold rounded-full">
                      Más popular
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-white mb-1">{plan.nombre}</h2>
                  <p className="text-3xl font-bold text-faena mb-1">
                    {formatCLP(plan.precio)}
                    {plan.precio > 0 && (
                      <span className="text-sm text-gray-500 font-normal"> /mes</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    {plan.vacantes_incluidas} vacantes activas
                  </p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {(plan.caracteristicas || []).map((c) => (
                      <li key={c} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-faena flex-shrink-0">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/auth/signup?role=empresa&plan=${encodeURIComponent(plan.nombre)}`}
                    className={featured ? 'btn-primary text-center' : 'btn-secondary text-center'}
                  >
                    {plan.precio === 0 ? 'Empezar gratis' : 'Elegir plan'}
                  </Link>
                  {plan.precio > 0 && (
                    <p className="text-[10px] text-gray-600 text-center mt-3">
                      Checkout Transbank · Factura electrónica
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card p-6 text-sm text-gray-400">
            <h3 className="text-white font-semibold mb-2">Integración de pagos (Transbank)</h3>
            <p>
              Elegimos <strong className="text-gray-300">Transbank Webpay Plus</strong> por ser el
              estándar de e-commerce en Chile (tarjetas locales, Onepay, cuotas). La integración
              completa requiere:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-500">
              <li>Código de comercio + API Key en Dashboard Transbank (ambiente integration)</li>
              <li>
                Edge Function / Route Handler <code className="text-faena-300">/api/payments/create</code>
              </li>
              <li>
                Callback <code className="text-faena-300">/api/payments/return</code> que actualiza{' '}
                <code>suscripciones_empresa</code> y <code>pagos</code>
              </li>
              <li>Variables <code>TRANSBANK_*</code> en Vercel (ver .env.local.example)</li>
            </ol>
            <p className="mt-3">
              Schema listo en migraciones 006. UI de checkout: feature flag{' '}
              <code className="text-faena-300">NEXT_PUBLIC_PAYMENTS_ENABLED</code>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
