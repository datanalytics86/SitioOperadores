import Link from 'next/link';
import { Vacante } from '@/types';

interface VacanteCardProps {
  vacante: Vacante;
}

export default function VacanteCard({ vacante }: VacanteCardProps) {
  return (
    <Link href={`/vacantes/${vacante.id}`}>
      <div className="card p-6 cursor-pointer group">
        {/* Header */}
        <div className="mb-4">
          <p className="section-label mb-2">{vacante.equipo_requerido}</p>
          <h3 className="text-xl font-semibold text-white group-hover:text-faena transition-colors">
            {vacante.titulo}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{vacante.descripcion}</p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Región:</span>
            <span className="text-white">{vacante.region}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Turno:</span>
            <span className="text-faena-300 capitalize">{vacante.turno}</span>
          </div>
          {vacante.salario_min && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Sueldo:</span>
              <span className="text-faena font-semibold">
                ${(vacante.salario_min / 1000).toFixed(0)}k - ${(vacante.salario_max ? vacante.salario_max / 1000 : 0).toFixed(0)}k
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-ink-600 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {vacante.cantidad_vacantes} {vacante.cantidad_vacantes === 1 ? 'vacante' : 'vacantes'}
          </span>
          <button className="text-faena text-sm font-semibold hover:text-faena-300 transition-colors">
            Postular →
          </button>
        </div>
      </div>
    </Link>
  );
}
