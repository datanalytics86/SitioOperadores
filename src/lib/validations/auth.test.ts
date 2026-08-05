import { describe, it, expect } from 'vitest';
import {
  passwordSchema,
  emailSchema,
  signUpSchema,
  validatePassword,
} from './auth';

describe('passwordSchema', () => {
  it('acepta contraseña fuerte', () => {
    expect(passwordSchema.safeParse('Faena2026').success).toBe(true);
  });

  it('rechaza menos de 8 caracteres', () => {
    expect(passwordSchema.safeParse('Ab1cdef').success).toBe(false);
  });

  it('rechaza sin mayúscula', () => {
    expect(passwordSchema.safeParse('faena2026').success).toBe(false);
  });

  it('rechaza sin número', () => {
    expect(passwordSchema.safeParse('Faenaaaaa').success).toBe(false);
  });

  it('validatePassword devuelve mensaje legible', () => {
    expect(validatePassword('short')).toMatch(/8/);
  });
});

describe('emailSchema', () => {
  it('acepta email válido', () => {
    expect(emailSchema.safeParse('op@operadoresfaena.cl').success).toBe(true);
  });

  it('rechaza email inválido', () => {
    expect(emailSchema.safeParse('no-es-email').success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('valida payload completo', () => {
    const r = signUpSchema.safeParse({
      email: 'a@b.com',
      password: 'Segura123',
      role: 'operador',
    });
    expect(r.success).toBe(true);
  });

  it('rechaza rol inválido', () => {
    const r = signUpSchema.safeParse({
      email: 'a@b.com',
      password: 'Segura123',
      role: 'admin',
    });
    expect(r.success).toBe(false);
  });
});
