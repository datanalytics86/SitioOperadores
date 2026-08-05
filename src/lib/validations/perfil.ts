import { z } from 'zod';
import { REGIONES } from '@/lib/constants/chile';

const rutRegex = /^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$/;

export const updateOperadorSchema = z.object({
  nombre_completo: z.string().trim().min(3).max(120),
  telefono: z.string().trim().min(8).max(20),
  años_experiencia: z.coerce.number().int().min(0).max(50),
  region: z.string().min(1),
  ciudad: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(1000).optional().nullable(),
  disponible: z.coerce.boolean().default(true),
  licencias: z.array(z.string()).default([]),
  equipos_operados: z.array(z.string()).min(1, 'Selecciona al menos un equipo'),
  certificaciones: z.array(z.string()).default([]),
});

export const updateEmpresaSchema = z.object({
  nombre: z.string().trim().min(2).max(150),
  telefono: z.string().trim().min(8).max(20),
  region: z.string().min(1),
  ciudad: z.string().trim().min(2).max(80),
  sitio_web: z
    .string()
    .trim()
    .url('URL inválida')
    .optional()
    .nullable()
    .or(z.literal('')),
  descripcion: z.string().trim().max(2000).optional().nullable(),
});

export const setupOperadorSchema = updateOperadorSchema.extend({
  rut: z.string().trim().regex(rutRegex, 'RUT inválido (ej: 12.345.678-9)'),
});

export const setupEmpresaSchema = updateEmpresaSchema.extend({
  rut: z.string().trim().regex(rutRegex, 'RUT inválido (ej: 76.123.456-7)'),
});

export type UpdateOperadorInput = z.infer<typeof updateOperadorSchema>;
export type UpdateEmpresaInput = z.infer<typeof updateEmpresaSchema>;

export { REGIONES };
