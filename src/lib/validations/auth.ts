import { z } from 'zod';

/**
 * Password policy (Tier-1):
 * - mínimo 8 caracteres
 * - al menos 1 mayúscula, 1 minúscula, 1 dígito
 * Sin caracteres especiales obligatorios: operadores de faena
 * suelen usar teclados móviles y contraseñas memorables.
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña es demasiado larga')
  .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula')
  .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
  .regex(/[0-9]/, 'Debe incluir al menos un número');

export const emailSchema = z
  .string()
  .trim()
  .email('Correo electrónico inválido')
  .max(255);

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['operador', 'empresa']),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** Mensaje de ayuda para UI (placeholder / hint) */
export const PASSWORD_HINT =
  'Mínimo 8 caracteres, con mayúscula, minúscula y número';

export function validatePassword(password: string): string | null {
  const result = passwordSchema.safeParse(password);
  if (result.success) return null;
  return result.error.errors[0]?.message ?? 'Contraseña inválida';
}
