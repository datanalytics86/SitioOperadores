import Link from 'next/link';
import type { VacanteListItem } from '@/lib/data/vacantes';
import { PostularButton } from './PostularButton';

export function VacanteJobCard({
  vacante,
  compact = false,
}: {
  vacante: VacanteListItem;
  compact?: boolean;
}) {
  const isReal = !vacante.id.startsWith('mock-');
  const dias = Math.floor(
    (Date.now() - new Date(vacante.created_at).getTime()) / 86400000
  );

  return (
    <div
      className={`card ${compact ? 'p-5' : 'p-6'} flex flex-col group hover:-translate-y-0.5 transition-transform duration-200`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="px-2.5 py-1 bg-faena/15 border border-faena/30 text-faena-300 text-xs font-semibold rounded-full">
          {vacante.equipo_requerido}
        </span>
        <span className="text-xs text-gray-600 flex-shrink-0">
          {dias === 0 ? 'Hoy' : `Hace ${dias}d`}
        </span>
      </div>

      <h3 className="text-base font-bold text-white group-hover:text-faena transition-colors mb-1 line-clamp-2">
        {vacante.titulo}
      </h3>
      {vacante.empresa && (
        <p className="text-xs text-gray-500 mb-3">{vacante.empresa.nombre}</p>
      )}

      {!compact && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
          {vacante.descripcion}
        </p>
      )}

      <div className="space-y-1.5 mb-4 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          {vacante.ciudad}, {vacante.region}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-faena-300 capitalize font-medium">{vacante.turno}</span>
          <span className="text-gray-500">{vacante.experiencia_minima}+ años</span>
        </div>
        {vacante.salario_min != null && (
          <p className="text-faena font-bold text-sm">
            ${Math.round(vacante.salario_min / 1000)}k &ndash; $
            {Math.round((vacante.salario_max || 0) / 1000)}k
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-ink-600">
        {isReal ? (
          <Link
            href={`/vacantes/${vacante.id}`}
            className="flex-1 btn-secondary text-xs text-center py-2"
          >
            Ver más
          </Link>
        ) : (
          <span className="flex-1 py-2 text-xs text-center text-gray-600 bg-ink-600/40 rounded-lg">
            Demo
          </span>
        )}
        <PostularButton vacante={vacante} className="flex-1 btn-primary text-xs py-2" />
      </div>
    </div>
  );
}
