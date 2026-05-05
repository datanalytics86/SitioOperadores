import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-16 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <p className="text-8xl font-display text-faena mb-4">404</p>
          <h1 className="text-3xl font-bold text-white mb-3">Página no encontrada</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Esta página no existe o fue movida. Vuelve a la plataforma para encontrar empleos de maquinaria pesada en Chile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary">
              Ir al inicio
            </Link>
            <Link href="/#empleos" className="btn-secondary">
              Ver empleos
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
