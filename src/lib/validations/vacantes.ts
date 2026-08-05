import { z } from 'zod';
import { EQUIPOS, REGIONES, TURNOS } from '@/lib/constants/chile';

export const createVacanteSchema = z
  .object({
    titulo: z.string().trim().min(5, 'Título muy corto').max(120),
    descripcion: z.string().trim().min(20, 'Describe el puesto con más detalle').max(5000),
    equipo_requerido: z.string().min(1, 'Selecciona un equipo'),
    experiencia_minima: z.coerce.number().int().min(0).max(50).default(0),
    region: z.string().min(1, 'Selecciona una región'),
    ciudad: z.string().trim().min(2).max(80),
    turno: z.enum(['mañana', 'tarde', 'noche', 'rotativo']),
    salario_min: z.coerce.number().int().positive().optional().nullable(),
    salario_max: z.coerce.number().int().positive().optional().nullable(),
    cantidad_vacantes: z.coerce.number().int().min(1).max(100).default(1),
  })
  .refine(
    (d) =>
      d.salario_min == null ||
      d.salario_max == null ||
      d.salario_max >= d.salario_min,
    { message: 'Salario máximo debe ser ≥ mínimo', path: ['salario_max'] }
  );

export const postularSchema = z.object({
  vacante_id: z.string().uuid('Vacante inválida'),
  mensaje: z.string().trim().max(1000).optional().nullable(),
});

export const updatePostulacionEstadoSchema = z.object({
  postulacion_id: z.string().uuid(),
  estado: z.enum(['pendiente', 'visto', 'aceptado', 'rechazado']),
  comentarios_empresa: z.string().trim().max(1000).optional().nullable(),
});

export type CreateVacanteInput = z.infer<typeof createVacanteSchema>;
export type PostularInput = z.infer<typeof postularSchema>;

// Re-export for forms
export { EQUIPOS, REGIONES, TURNOS };
