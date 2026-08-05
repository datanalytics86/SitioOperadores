'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  updateEmpresaSchema,
  updateOperadorSchema,
} from '@/lib/validations/perfil';

export type ActionResult = { success: true } | { success: false; error: string };

export async function updateOperadorPerfilAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = updateOperadorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || 'Datos inválidos',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autenticado' };

  const { error } = await supabase
    .from('operadores')
    .update({
      nombre_completo: parsed.data.nombre_completo,
      telefono: parsed.data.telefono,
      años_experiencia: parsed.data.años_experiencia,
      region: parsed.data.region,
      ciudad: parsed.data.ciudad,
      bio: parsed.data.bio ?? null,
      disponible: parsed.data.disponible,
      licencias: parsed.data.licencias,
      equipos_operados: parsed.data.equipos_operados,
      certificaciones: parsed.data.certificaciones,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/operador');
  return { success: true };
}

export async function updateEmpresaPerfilAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = updateEmpresaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || 'Datos inválidos',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autenticado' };

  const { error } = await supabase
    .from('empresas')
    .update({
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      region: parsed.data.region,
      ciudad: parsed.data.ciudad,
      sitio_web: parsed.data.sitio_web || null,
      descripcion: parsed.data.descripcion ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/empresa');
  return { success: true };
}
