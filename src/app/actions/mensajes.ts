'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const sendSchema = z.object({
  vacante_id: z.string().uuid(),
  operador_id: z.string().uuid(),
  empresa_id: z.string().uuid(),
  texto: z.string().trim().min(1).max(2000),
  emisor: z.enum(['operador', 'empresa']),
});

export type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function sendMensajeAction(input: unknown): Promise<ActionResult> {
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Datos inválidos' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  // Verificar que el emisor coincide con el perfil del usuario
  if (parsed.data.emisor === 'operador') {
    const { data: op } = await supabase
      .from('operadores')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', parsed.data.operador_id)
      .maybeSingle();
    if (!op) return { success: false, error: 'No autorizado como operador' };
  } else {
    const { data: em } = await supabase
      .from('empresas')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', parsed.data.empresa_id)
      .maybeSingle();
    if (!em) return { success: false, error: 'No autorizado como empresa' };
  }

  const { data, error } = await supabase
    .from('mensajes')
    .insert({
      vacante_id: parsed.data.vacante_id,
      operador_id: parsed.data.operador_id,
      empresa_id: parsed.data.empresa_id,
      emisor: parsed.data.emisor,
      texto: parsed.data.texto,
    })
    .select('id')
    .maybeSingle();

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/empresa/mensajes');
  revalidatePath('/dashboard/operador/mensajes');
  return { success: true, id: data!.id };
}
