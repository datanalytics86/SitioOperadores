'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-ink-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-faena-300 text-sm font-semibold uppercase tracking-wider mb-3">
          Error
        </p>
        <h1 className="text-3xl font-bold text-white mb-3">Algo salió mal</h1>
        <p className="text-gray-400 mb-6">
          Tuvimos un problema procesando tu solicitud. Puedes reintentar o volver al inicio.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-600 mb-6">Código de referencia: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary px-6">
            Reintentar
          </button>
          <Link href="/" className="btn-secondary px-6">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
