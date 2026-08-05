'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  postularSchema,
  updatePostulacionEstadoSchema,
} from '@/lib/validations/vacantes';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { VACANTES_TAG } from '@/lib/data/vacantes';

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function postularAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = postularSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Datos inválidos' };
  }

  // Rate limit por usuario
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para postular' };
  }

  const rl = await rateLimit(`postular:${user.id}`, RATE_LIMITS.postular);
  if (!rl.success) {
    return { success: false, error: 'Demasiadas postulaciones. Espera un momento.' };
  }

  if (parsed.data.vacante_id.startsWith('mock-')) {
    return {
      success: false,
      error: 'Esta vacante es de demostración. No se puede postular.',
    };
  }

  const { data: operador } = await supabase
    .from('operadores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!operador) {
    return {
      success: false,
      error: 'Completa tu perfil de operador antes de postular',
    };
  }

  const { data, error } = await supabase
    .from('postulaciones')
    .insert({
      vacante_id: parsed.data.vacante_id,
      operador_id: operador.id,
      estado: 'pendiente',
      mensaje: parsed.data.mensaje || null,
    })
    .select('id')
    .maybeSingle();

  if (error) {
    if (error.code === '23505' || error.message?.includes('duplicate')) {
      return { success: false, error: 'Ya postulaste a esta vacante anteriormente.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/operador');
  revalidatePath('/dashboard/empresa');
  return { success: true, data: { id: data!.id } };
}

export async function updatePostulacionEstadoAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = updatePostulacionEstadoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Datos inválidos' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verificar que la empresa es dueña de la vacante (RLS también lo cubre)
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!empresa) {
    return { success: false, error: 'Solo empresas pueden cambiar el estado' };
  }

  const { error } = await supabase
    .from('postulaciones')
    .update({
      estado: parsed.data.estado,
      comentarios_empresa: parsed.data.comentarios_empresa ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.postulacion_id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/empresa');
  revalidatePath('/dashboard/operador');
  revalidateTag(VACANTES_TAG);
  return { success: true };
}
