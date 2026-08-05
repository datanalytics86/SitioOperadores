'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createVacanteSchema } from '@/lib/validations/vacantes';
import { VACANTES_TAG } from '@/lib/data/vacantes';

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function createVacanteAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createVacanteSchema.safeParse(input);
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

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!empresa) {
    return { success: false, error: 'Completa el perfil de empresa primero' };
  }

  const { data, error } = await supabase
    .from('vacantes')
    .insert({
      empresa_id: empresa.id,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion,
      equipo_requerido: parsed.data.equipo_requerido,
      experiencia_minima: parsed.data.experiencia_minima,
      region: parsed.data.region,
      ciudad: parsed.data.ciudad,
      turno: parsed.data.turno,
      salario_min: parsed.data.salario_min ?? null,
      salario_max: parsed.data.salario_max ?? null,
      cantidad_vacantes: parsed.data.cantidad_vacantes,
      activa: true,
    })
    .select('id')
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateTag(VACANTES_TAG);
  revalidatePath('/');
  revalidatePath('/vacantes');
  revalidatePath('/dashboard/empresa');

  return { success: true, data: { id: data!.id } };
}

export async function toggleVacanteActivaAction(
  vacanteId: string,
  activa: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autenticado' };

  const { error } = await supabase
    .from('vacantes')
    .update({ activa, updated_at: new Date().toISOString() })
    .eq('id', vacanteId);

  if (error) return { success: false, error: error.message };

  revalidateTag(VACANTES_TAG);
  revalidatePath('/dashboard/empresa');
  revalidatePath('/');
  revalidatePath('/vacantes');
  return { success: true };
}
